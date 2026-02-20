import { eq } from "drizzle-orm";
import { libraries, chunks, libraryStats, type Database } from "@nexus/db";
import { fetchGitHubDocs, getGitHubRepoMetadata } from "./fetchers/github";
import { chunkFiles } from "./chunker";
import { generateEmbeddings } from "./embeddings";
import type { IngestionJob, ChunkData } from "../types";

/**
 * Process an ingestion job for a library.
 * 
 * This is called by the queue consumer and handles the full
 * ingestion pipeline:
 * 1. Update status to "indexing"
 * 2. Fetch documentation from source
 * 3. Chunk content
 * 4. Generate embeddings
 * 5. Store chunks in R2
 * 6. Index embeddings in Vectorize
 * 7. Update D1 metadata
 */
export async function processIngestionJob(
  job: IngestionJob,
  env: Env,
  db: Database
): Promise<void> {
  const { libraryId, sourceUrl, sourceType } = job;
  const startTime = Date.now();

  console.log(`Starting ingestion for ${libraryId} from ${sourceUrl}`);

  try {
    // Step 1: Update status to indexing
    await db
      .update(libraries)
      .set({
        indexStatus: "indexing",
        indexError: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(libraries.id, libraryId));

    // Step 2: Fetch documentation from source
    let files: Array<{ path: string; content: string }>;
    
    if (sourceType === "github") {
      // Try to get GitHub token from env for higher rate limits
      const token = (env as unknown as { GITHUB_TOKEN?: string }).GITHUB_TOKEN;
      files = await fetchGitHubDocs(sourceUrl, token);
      
      // Also fetch repo metadata to update library info
      const metadata = await getGitHubRepoMetadata(sourceUrl, token);
      if (metadata.description || metadata.homepage) {
        await db
          .update(libraries)
          .set({
            description: metadata.description,
            homepageUrl: metadata.homepage,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(libraries.id, libraryId));
      }
    } else {
      throw new Error(`Unsupported source type: ${sourceType}`);
    }

    if (files.length === 0) {
      throw new Error("No documentation files found in repository");
    }

    console.log(`Fetched ${files.length} files for ${libraryId}`);

    // Step 3: Chunk content
    const allChunks = chunkFiles(files, {
      maxTokens: 512,
      overlap: 50,
      preserveCodeBlocks: true,
    });

    if (allChunks.length === 0) {
      throw new Error("No chunks generated from documentation");
    }

    console.log(`Generated ${allChunks.length} chunks for ${libraryId}`);

    // Step 4: Generate embeddings
    const embeddings = await generateEmbeddings(allChunks, env.AI);

    console.log(`Generated ${embeddings.length} embeddings for ${libraryId}`);

    // Step 5: Delete old chunks for this library (if re-indexing)
    await deleteOldChunks(libraryId, env, db);

    // Step 6: Store chunks in R2
    await storeChunksInR2(libraryId, allChunks, env);

    console.log(`Stored ${allChunks.length} chunks in R2 for ${libraryId}`);

    // Step 7: Index embeddings in Vectorize
    await indexInVectorize(libraryId, allChunks, embeddings, env);

    console.log(`Indexed ${allChunks.length} vectors in Vectorize for ${libraryId}`);

    // Step 8: Store chunk metadata in D1
    await storeChunkMetadata(libraryId, allChunks, db);

    console.log(`Stored chunk metadata in D1 for ${libraryId}`);

    // Step 9: Update library status to indexed
    const totalTokens = allChunks.reduce((sum, c) => sum + c.tokenCount, 0);
    await db
      .update(libraries)
      .set({
        indexStatus: "indexed",
        totalChunks: allChunks.length,
        totalTokens,
        lastIndexedAt: new Date().toISOString(),
        indexError: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(libraries.id, libraryId));

    // Initialize stats if not exists
    const existingStats = await db
      .select()
      .from(libraryStats)
      .where(eq(libraryStats.libraryId, libraryId))
      .limit(1);

    if (existingStats.length === 0) {
      await db.insert(libraryStats).values({
        libraryId,
        totalQueries: 0,
        totalChunkHits: 0,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`Completed ingestion for ${libraryId} in ${duration}ms`);
  } catch (error) {
    console.error(`Ingestion failed for ${libraryId}:`, error);

    // Update status to failed
    await db
      .update(libraries)
      .set({
        indexStatus: "failed",
        indexError: error instanceof Error ? error.message : String(error),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(libraries.id, libraryId));

    throw error;
  }
}

/**
 * Delete old chunks for a library (used when re-indexing).
 */
async function deleteOldChunks(
  libraryId: string,
  env: Env,
  db: Database
): Promise<void> {
  // Get existing chunk IDs
  const existingChunks = await db
    .select({ id: chunks.id, r2Key: chunks.r2Key })
    .from(chunks)
    .where(eq(chunks.libraryId, libraryId));

  if (existingChunks.length === 0) return;

  console.log(`Deleting ${existingChunks.length} old chunks for ${libraryId}`);

  // Delete from R2
  for (const chunk of existingChunks) {
    try {
      await env.DOCS_BUCKET.delete(chunk.r2Key);
    } catch (error) {
      console.warn(`Failed to delete R2 object ${chunk.r2Key}:`, error);
    }
  }

  // Delete from Vectorize (batch delete)
  const chunkIds = existingChunks.map((c) => c.id);
  try {
    await env.VECTORIZE.deleteByIds(chunkIds);
  } catch (error) {
    console.warn(`Failed to delete vectors:`, error);
  }

  // Delete from D1
  await db.delete(chunks).where(eq(chunks.libraryId, libraryId));
}

/**
 * Store chunk content in R2.
 */
async function storeChunksInR2(
  libraryId: string,
  chunkData: ChunkData[],
  env: Env
): Promise<void> {
  // Process in batches to avoid overwhelming R2
  const BATCH_SIZE = 50;

  for (let i = 0; i < chunkData.length; i += BATCH_SIZE) {
    const batch = chunkData.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((chunk) => {
        const r2Key = `${libraryId}/${chunk.id}`;
        return env.DOCS_BUCKET.put(r2Key, chunk.content, {
          customMetadata: {
            libraryId,
            title: chunk.title || "",
            contentType: chunk.contentType,
            sourceFile: chunk.sourceFile || "",
          },
        });
      })
    );
  }
}

/**
 * Index embeddings in Vectorize.
 */
async function indexInVectorize(
  libraryId: string,
  chunkData: ChunkData[],
  embeddings: Array<{ chunkId: string; embedding: number[] }>,
  env: Env
): Promise<void> {
  // Create embedding lookup
  const embeddingMap = new Map(embeddings.map((e) => [e.chunkId, e.embedding]));

  // Prepare vectors
  const vectors = chunkData.map((chunk) => ({
    id: chunk.id,
    values: embeddingMap.get(chunk.id)!,
    metadata: {
      libraryId,
      title: chunk.title || "",
      contentType: chunk.contentType,
      sourceFile: chunk.sourceFile || "",
    },
  }));

  // Upsert in batches (Vectorize limit is 1000)
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await env.VECTORIZE.upsert(batch);
  }
}

/**
 * Store chunk metadata in D1.
 */
async function storeChunkMetadata(
  libraryId: string,
  chunkData: ChunkData[],
  db: Database
): Promise<void> {
  const now = new Date().toISOString();

  // Insert in batches to avoid SQLite/D1 parameter limits (100 params per query)
  // Each row has ~8 columns, so we can do about 12 rows per batch
  const BATCH_SIZE = 10;

  for (let i = 0; i < chunkData.length; i += BATCH_SIZE) {
    const batch = chunkData.slice(i, i + BATCH_SIZE);
    await db.insert(chunks).values(
      batch.map((chunk) => ({
        id: chunk.id,
        libraryId,
        title: chunk.title,
        contentType: chunk.contentType,
        tokenCount: chunk.tokenCount,
        sourceFile: chunk.sourceFile,
        r2Key: `${libraryId}/${chunk.id}`,
        createdAt: now,
      }))
    );
  }
}
