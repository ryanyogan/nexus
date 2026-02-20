import type { ChunkData } from "../types";

interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
}

/**
 * Generate embeddings for a batch of chunks using Workers AI.
 * 
 * Uses @cf/baai/bge-base-en-v1.5 which outputs 768-dimensional vectors.
 */
export async function generateEmbeddings(
  chunks: ChunkData[],
  ai: Ai
): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];

  // Process in batches of 100 (API limit)
  const BATCH_SIZE = 100;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    
    // Prepare texts for embedding
    // Include title for better context
    const texts = batch.map((chunk) => {
      if (chunk.title) {
        return `${chunk.title}\n\n${chunk.content}`;
      }
      return chunk.content;
    });

    // Call Workers AI
    const embeddingResponse = await ai.run("@cf/baai/bge-base-en-v1.5", {
      text: texts,
    });

    // Extract embeddings from response
    // The response structure can vary, handle both cases
    const embeddings: number[][] = Array.isArray(embeddingResponse)
      ? embeddingResponse
      : (embeddingResponse as { data: number[][] }).data;

    // Map embeddings to chunks
    for (let j = 0; j < batch.length; j++) {
      results.push({
        chunkId: batch[j].id,
        embedding: embeddings[j],
      });
    }

    console.log(`Generated embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
  }

  return results;
}

/**
 * Generate a single embedding for a query string.
 */
export async function generateQueryEmbedding(
  query: string,
  ai: Ai
): Promise<number[]> {
  const response = await ai.run("@cf/baai/bge-base-en-v1.5", {
    text: [query],
  });

  const embeddings: number[][] = Array.isArray(response)
    ? response
    : (response as { data: number[][] }).data;

  return embeddings[0];
}
