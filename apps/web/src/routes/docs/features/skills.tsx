import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";
import { Zap, Code2, FileText, TestTube, Database } from "lucide-react";

export const Route = createFileRoute("/docs/features/skills")({
  component: SkillsDocs,
});

function SkillsDocs() {
  return (
    <DocsLayout
      title="AI Skills"
      description="Pre-built instructions for common development tasks"
    >
      {/* Hero */}
      <div className="mb-12 rounded-xl border border-border/50 bg-gradient-to-br from-purple-500/10 via-transparent to-primary/10 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">New Feature</span>
        </div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          What are AI Skills?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          AI Skills are curated instruction sets that help your AI assistant follow best practices
          for specific tasks. Think of them as pre-written prompts that encode expert knowledge
          for code review, documentation, testing, and more.
        </p>
      </div>

      {/* Why Skills */}
      <section className="mb-12">
        <h2 id="why-skills" className="mb-6 text-xl font-semibold text-foreground">
          Why Use Skills?
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            icon={<Code2 className="h-5 w-5" />}
            title="Consistent Quality"
            description="Every code review follows the same thorough checklist. No more hit-or-miss AI responses."
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Expert Knowledge"
            description="Skills encode best practices from experienced developers. Learn as you code."
          />
          <FeatureCard
            icon={<TestTube className="h-5 w-5" />}
            title="Task-Specific"
            description="Different skills for different tasks: code review, testing, documentation, refactoring."
          />
          <FeatureCard
            icon={<Database className="h-5 w-5" />}
            title="Community Curated"
            description="Skills are reviewed and maintained. Submit your own or use official ones."
          />
        </div>
      </section>

      {/* Skill Types */}
      <section className="mb-12">
        <h2 id="skill-types" className="mb-6 text-xl font-semibold text-foreground">
          Skill Types
        </h2>

        <div className="space-y-4">
          <TypeCard
            type="analysis"
            color="blue"
            title="Analysis"
            description="Review, audit, and analyze code. Code review, security audit, performance analysis."
          />
          <TypeCard
            type="generation"
            color="green"
            title="Generation"
            description="Create new code or content. Component generation, test writing, documentation."
          />
          <TypeCard
            type="transformation"
            color="purple"
            title="Transformation"
            description="Modify existing code. Refactoring, migrations, modernization."
          />
          <TypeCard
            type="integration"
            color="orange"
            title="Integration"
            description="Connect systems together. API integration, database setup, deployment."
          />
          <TypeCard
            type="utility"
            color="gray"
            title="Utility"
            description="General purpose helpers. Debugging, research, explanation."
          />
        </div>
      </section>

      {/* Using Skills */}
      <section className="mb-12">
        <h2 id="using-skills" className="mb-6 text-xl font-semibold text-foreground">
          Using Skills
        </h2>

        <p className="mb-4 text-muted-foreground">
          Skills are loaded via the MCP tools. Ask your AI assistant to load a skill:
        </p>

        <CodeBlock language="text">
{`> Load the code-review skill and review my changes

AI: I'll load the code-review skill to review your code...

[Skill loaded - AI now follows code review best practices]

Let me review your changes:
1. Security: No issues found
2. Performance: Consider memoizing this expensive calculation...
3. Maintainability: Extract this logic into a custom hook...`}
        </CodeBlock>

        <Callout type="tip" title="Pro tip">
          You can browse all available skills at{" "}
          <Link to="/explore" search={{ tab: "skills" }} className="text-primary hover:underline">
            /explore
          </Link>
          {" "}and install them to track your favorites.
        </Callout>
      </section>

      {/* Popular Skills */}
      <section className="mb-12">
        <h2 id="popular-skills" className="mb-6 text-xl font-semibold text-foreground">
          Popular Skills
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <SkillCard
            name="Code Review"
            type="analysis"
            description="Comprehensive code review checking security, performance, maintainability, and best practices."
          />
          <SkillCard
            name="React Best Practices"
            type="generation"
            description="Write idiomatic React code with hooks, proper state management, and accessibility."
          />
          <SkillCard
            name="Test Generation"
            type="generation"
            description="Generate comprehensive test suites with unit, integration, and e2e tests."
          />
          <SkillCard
            name="API Documentation"
            type="generation"
            description="Generate OpenAPI specs, README docs, and inline documentation."
          />
          <SkillCard
            name="Database Schema"
            type="analysis"
            description="Design and optimize database schemas with indexing strategies."
          />
          <SkillCard
            name="Performance Audit"
            type="analysis"
            description="Identify bottlenecks, memory leaks, and optimization opportunities."
          />
        </div>
      </section>

      {/* API Access */}
      <section className="mb-12">
        <h2 id="api" className="mb-6 text-xl font-semibold text-foreground">
          API Access
        </h2>

        <p className="mb-4 text-muted-foreground">
          Skills are available via the REST API:
        </p>

        <CodeBlock language="bash">
{`# List all skills
curl https://api.nexus.yogan.dev/api/skills

# Get skill details with content
curl https://api.nexus.yogan.dev/api/skills/code-review

# Filter by type
curl https://api.nexus.yogan.dev/api/skills?type=analysis

# Search skills
curl https://api.nexus.yogan.dev/api/skills?search=react`}
        </CodeBlock>
      </section>

      {/* Coming Soon */}
      <section>
        <h2 id="coming-soon" className="mb-6 text-xl font-semibold text-foreground">
          Coming Soon
        </h2>

        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Submit your own skills
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Skill versioning and changelogs
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Team-specific private skills
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Skill composition (combine multiple skills)
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function TypeCard({
  type,
  color,
  title,
  description,
}: {
  type: string;
  color: string;
  title: string;
  description: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border/50 bg-card/50 p-4">
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colorClasses[color]}`}>
        {type}
      </span>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SkillCard({
  name,
  type,
  description,
}: {
  name: string;
  type: string;
  description: string;
}) {
  const typeColors: Record<string, string> = {
    analysis: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    generation: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-purple-600" />
        <h3 className="font-semibold text-foreground">{name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[type] || typeColors.analysis}`}>
          {type}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
