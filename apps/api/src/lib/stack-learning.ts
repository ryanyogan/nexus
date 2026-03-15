import { eq, and, sql } from "drizzle-orm";
import {
  stacks,
  stackRepos,
  stackPackages,
  stackCompositions,
  libraries,
  PACKAGE_REGISTRIES,
  type Database,
  type Stack,
  type StackRepo,
  type StackPackage,
  type PackageRegistry,
} from "@nexus/db";
import type { StackLearningJob } from "../types";
import { analyzeGitHubRepo, type RepoAnalysis } from "./repo-analyzer";
import { compileStackPrompt } from "./stack-compiler";

/**
 * Process a stack learning job.
 * 
 * Jobs can be:
 * 1. analyze_repo - Analyze a GitHub repository for patterns/paradigms
 * 2. research_package - Research a package using existing library docs
 * 3. compile_prompt - Generate the final compiled prompt
 */
export async function processStackLearningJob(
  job: StackLearningJob,
  env: Env,
  db: Database
): Promise<void> {
  const { stackId, taskType } = job;
  const now = new Date().toISOString();

  console.log(`Processing stack learning job: ${taskType} for stack ${stackId}`);

  try {
    switch (taskType) {
      case "analyze_repo":
        await processRepoAnalysis(job, env, db);
        break;
      case "research_package":
        await processPackageResearch(job, env, db);
        break;
      case "compile_prompt":
        await processPromptCompilation(job, env, db);
        break;
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  } catch (error) {
    console.error(`Stack learning job failed: ${taskType} for stack ${stackId}`, error);
    
    // Update stack with error
    await db
      .update(stacks)
      .set({
        learningStatus: "failed",
        learningError: error instanceof Error ? error.message : String(error),
        updatedAt: now,
      })
      .where(eq(stacks.id, stackId));
    
    throw error;
  }
}

/**
 * Analyze a GitHub repository for patterns, structure, and paradigms.
 */
async function processRepoAnalysis(
  job: StackLearningJob,
  env: Env,
  db: Database
): Promise<void> {
  const { stackId, repoId, githubUrl, isPrivate, branch, paths } = job;
  
  if (!repoId || !githubUrl) {
    throw new Error("repoId and githubUrl are required for repo analysis");
  }

  const now = new Date().toISOString();

  // Update repo status
  await db
    .update(stackRepos)
    .set({ status: "analyzing" })
    .where(eq(stackRepos.id, repoId));

  // Update stack progress
  await db
    .update(stacks)
    .set({
      learningStatus: "researching",
      learningProgress: 10,
      updatedAt: now,
    })
    .where(eq(stacks.id, stackId));

  try {
    // Get GitHub token for API access
    const token = isPrivate 
      ? await getPrivateRepoToken(job.userId, env, db)
      : (env as any).GITHUB_TOKEN;

    // Analyze the repository
    const analysis = await analyzeGitHubRepo(githubUrl, {
      token,
      branch: branch || "main",
      paths: paths || [],
    });

    // Store analysis in R2
    const r2Key = `stacks/${stackId}/repos/${repoId}.json`;
    await env.DOCS_BUCKET.put(r2Key, JSON.stringify(analysis), {
      httpMetadata: { contentType: "application/json" },
    });

    // Update repo with results
    await db
      .update(stackRepos)
      .set({
        status: "complete",
        r2Key,
        summary: analysis.summary,
        paradigms: analysis.paradigms,
        packages: analysis.packages,
        directoryStructure: JSON.stringify(analysis.directoryStructure),
        indexedAt: now,
      })
      .where(eq(stackRepos.id, repoId));

    // Extract packages for research
    if (analysis.packages && analysis.packages.length > 0) {
      const existingPackages = await db
        .select({ name: stackPackages.name })
        .from(stackPackages)
        .where(eq(stackPackages.stackId, stackId));
      
      const existingNames = new Set(existingPackages.map(p => p.name));
      
      const newPackages = analysis.packages
        .filter((pkg: string) => !existingNames.has(pkg))
        .slice(0, 20); // Limit to 20 packages

      if (newPackages.length > 0) {
        // Ensure registry is a valid type
        const registry = PACKAGE_REGISTRIES.includes(analysis.registry as PackageRegistry)
          ? (analysis.registry as PackageRegistry)
          : "npm";
        
        await db.insert(stackPackages).values(
          newPackages.map((name: string) => ({
            id: `pkg_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
            stackId,
            name,
            registry,
            status: "pending" as const,
            createdAt: now,
          }))
        );
      }
    }

    // Check if all repos are analyzed
    await checkAndAdvanceProgress(stackId, db, env);

  } catch (error) {
    await db
      .update(stackRepos)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      })
      .where(eq(stackRepos.id, repoId));
    
    throw error;
  }
}

/**
 * Research a package using existing Nexus library documentation.
 */
async function processPackageResearch(
  job: StackLearningJob,
  env: Env,
  db: Database
): Promise<void> {
  const { stackId, packageId, packageName, registry } = job;
  
  if (!packageId || !packageName) {
    throw new Error("packageId and packageName are required for package research");
  }

  const now = new Date().toISOString();

  // Update package status
  await db
    .update(stackPackages)
    .set({ status: "researching" })
    .where(eq(stackPackages.id, packageId));

  try {
    // Try to find existing library documentation
    const [library] = await db
      .select()
      .from(libraries)
      .where(eq(libraries.name, packageName))
      .limit(1);

    let documentationSummary: string | null = null;
    let keyApis: string[] = [];
    let libraryId: string | null = null;

    if (library && library.indexStatus === "indexed") {
      libraryId = library.id;
      documentationSummary = library.description || null;
      
      // TODO: Query vectorize for key APIs/patterns
      // For now, just mark as linked to library
    } else {
      // Package not in Nexus, use basic info
      documentationSummary = `Package: ${packageName} (${registry || "npm"})`;
    }

    // Update package with results
    await db
      .update(stackPackages)
      .set({
        status: "complete",
        libraryId,
        documentationSummary,
        keyApis: keyApis.length > 0 ? keyApis : null,
        researchedAt: now,
      })
      .where(eq(stackPackages.id, packageId));

    // Check if all packages are researched
    await checkAndAdvanceProgress(stackId, db, env);

  } catch (error) {
    await db
      .update(stackPackages)
      .set({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      })
      .where(eq(stackPackages.id, packageId));
    
    throw error;
  }
}

/**
 * Compile the final optimized prompt from all gathered knowledge.
 */
async function processPromptCompilation(
  job: StackLearningJob,
  env: Env,
  db: Database
): Promise<void> {
  const { stackId, tokenBudget } = job;
  const now = new Date().toISOString();

  // Update stack status
  await db
    .update(stacks)
    .set({
      learningStatus: "compiling",
      learningProgress: 80,
      updatedAt: now,
    })
    .where(eq(stacks.id, stackId));

  try {
    // Get the stack with all related data
    const [stack] = await db
      .select()
      .from(stacks)
      .where(eq(stacks.id, stackId))
      .limit(1);

    if (!stack) {
      throw new Error(`Stack not found: ${stackId}`);
    }

    // Get repos with their analysis
    const repos = await db
      .select()
      .from(stackRepos)
      .where(and(
        eq(stackRepos.stackId, stackId),
        eq(stackRepos.status, "complete")
      ));

    // Get packages with research
    const packages = await db
      .select()
      .from(stackPackages)
      .where(and(
        eq(stackPackages.stackId, stackId),
        eq(stackPackages.status, "complete")
      ));

    // Get composed child stacks
    const compositions = await db
      .select({
        childStack: stacks,
      })
      .from(stackCompositions)
      .innerJoin(stacks, eq(stackCompositions.childStackId, stacks.id))
      .where(eq(stackCompositions.parentStackId, stackId));

    // Load repo analyses from R2
    const repoAnalyses: RepoAnalysis[] = [];
    for (const repo of repos) {
      if (repo.r2Key) {
        try {
          const obj = await env.DOCS_BUCKET.get(repo.r2Key);
          if (obj) {
            const analysis = await obj.json() as RepoAnalysis;
            repoAnalyses.push(analysis);
          }
        } catch (e) {
          console.warn(`Failed to load repo analysis: ${repo.r2Key}`, e);
        }
      }
    }

    // Compile the prompt
    const compiled = await compileStackPrompt({
      stack,
      repos: repoAnalyses,
      packages,
      childStacks: compositions.map(c => c.childStack),
      tokenBudget: tokenBudget || stack.tokenBudget || "standard",
      ai: env.AI,
    });

    // Store full prompt in R2 if large
    let r2Key: string | null = null;
    if (compiled.prompt.length > 50000) {
      r2Key = `stacks/${stackId}/prompt.md`;
      await env.DOCS_BUCKET.put(r2Key, compiled.prompt, {
        httpMetadata: { contentType: "text/markdown" },
      });
    }

    // Update stack with compiled prompt
    await db
      .update(stacks)
      .set({
        compiledPrompt: compiled.prompt,
        tokenCount: compiled.tokenCount,
        r2Key,
        learningStatus: "complete",
        learningProgress: 100,
        learningError: null,
        compiledAt: now,
        updatedAt: now,
      })
      .where(eq(stacks.id, stackId));

    console.log(`Stack ${stackId} compiled successfully: ${compiled.tokenCount} tokens`);

  } catch (error) {
    await db
      .update(stacks)
      .set({
        learningStatus: "failed",
        learningError: error instanceof Error ? error.message : String(error),
        updatedAt: now,
      })
      .where(eq(stacks.id, stackId));
    
    throw error;
  }
}

/**
 * Check progress and advance to next stage if ready.
 */
async function checkAndAdvanceProgress(
  stackId: string,
  db: Database,
  env: Env
): Promise<void> {
  // Count pending repos and packages
  const [repoStatus] = await db
    .select({
      total: sql<number>`count(*)`,
      complete: sql<number>`sum(case when status = 'complete' then 1 else 0 end)`,
    })
    .from(stackRepos)
    .where(eq(stackRepos.stackId, stackId));

  const [pkgStatus] = await db
    .select({
      total: sql<number>`count(*)`,
      complete: sql<number>`sum(case when status = 'complete' then 1 else 0 end)`,
    })
    .from(stackPackages)
    .where(eq(stackPackages.stackId, stackId));

  const totalTasks = (repoStatus?.total || 0) + (pkgStatus?.total || 0);
  const completeTasks = (repoStatus?.complete || 0) + (pkgStatus?.complete || 0);

  // Calculate progress (reserving 20% for compilation)
  const progress = totalTasks > 0 
    ? Math.round((completeTasks / totalTasks) * 80)
    : 50;

  await db
    .update(stacks)
    .set({
      learningProgress: progress,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(stacks.id, stackId));

  // If all tasks complete, queue compilation
  if (totalTasks > 0 && completeTasks === totalTasks) {
    const [stack] = await db
      .select({ userId: stacks.userId, tokenBudget: stacks.tokenBudget })
      .from(stacks)
      .where(eq(stacks.id, stackId))
      .limit(1);

    if (stack) {
      const compilationJob: StackLearningJob = {
        stackId,
        userId: stack.userId || "",
        taskType: "compile_prompt",
        tokenBudget: stack.tokenBudget as any,
      };

      await env.STACK_LEARNING_QUEUE.send(compilationJob);
    }
  }
}

/**
 * Get token for private repo access from user's API vault.
 */
async function getPrivateRepoToken(
  userId: string,
  env: Env,
  db: Database
): Promise<string | undefined> {
  // TODO: Implement fetching from user secrets
  // For now, fall back to env token
  return (env as any).GITHUB_TOKEN;
}

/**
 * Queue all learning tasks for a stack.
 */
export async function queueStackLearning(
  stackId: string,
  userId: string,
  env: Env,
  db: Database
): Promise<void> {
  const now = new Date().toISOString();

  // Update stack status
  await db
    .update(stacks)
    .set({
      learningStatus: "researching",
      learningProgress: 0,
      learningError: null,
      updatedAt: now,
    })
    .where(eq(stacks.id, stackId));

  // Get repos to analyze
  const repos = await db
    .select()
    .from(stackRepos)
    .where(and(
      eq(stackRepos.stackId, stackId),
      eq(stackRepos.status, "pending")
    ));

  // Queue repo analysis jobs
  for (const repo of repos) {
    const job: StackLearningJob = {
      stackId,
      userId,
      taskType: "analyze_repo",
      repoId: repo.id,
      githubUrl: repo.githubUrl,
      isPrivate: repo.isPrivate,
      branch: repo.branch || "main",
      paths: repo.paths as string[] | undefined,
    };
    await env.STACK_LEARNING_QUEUE.send(job);
  }

  // Get packages to research
  const packages = await db
    .select()
    .from(stackPackages)
    .where(and(
      eq(stackPackages.stackId, stackId),
      eq(stackPackages.status, "pending")
    ));

  // Queue package research jobs
  for (const pkg of packages) {
    const job: StackLearningJob = {
      stackId,
      userId,
      taskType: "research_package",
      packageId: pkg.id,
      packageName: pkg.name,
      registry: pkg.registry,
    };
    await env.STACK_LEARNING_QUEUE.send(job);
  }

  // If no tasks, go straight to compilation
  if (repos.length === 0 && packages.length === 0) {
    const [stack] = await db
      .select({ tokenBudget: stacks.tokenBudget })
      .from(stacks)
      .where(eq(stacks.id, stackId))
      .limit(1);

    const compilationJob: StackLearningJob = {
      stackId,
      userId,
      taskType: "compile_prompt",
      tokenBudget: stack?.tokenBudget as any || "standard",
    };
    await env.STACK_LEARNING_QUEUE.send(compilationJob);
  }
}
