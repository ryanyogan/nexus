import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { Callout } from "../../components/docs/Callout";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/docs/submit")({
  component: SubmitDocs,
});

function SubmitDocs() {
  const toc = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "requirements", title: "Requirements", level: 2 },
    { id: "how-to-submit", title: "How to Submit", level: 2 },
    { id: "review-process", title: "Review Process", level: 2 },
    { id: "best-practices", title: "Best Practices", level: 2 },
  ];

  return (
    <DocsLayout
      title="Submit a Library"
      description="Request indexing for a new library"
      toc={toc}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 id="overview" className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>

        <p className="mb-4 text-muted-foreground">
          Nexus relies on community contributions to expand its library coverage.
          If you'd like to see a library indexed, you can submit it for review.
          Once approved, the library's documentation will be crawled, processed,
          and made available for semantic search.
        </p>

        <Callout type="info">
          Submitting a library doesn't guarantee it will be indexed. We review
          submissions to ensure quality and avoid duplicates.
        </Callout>
      </section>

      {/* Requirements */}
      <section className="mb-12">
        <h2 id="requirements" className="mb-4 text-xl font-semibold text-foreground">
          Requirements
        </h2>

        <p className="mb-4 text-muted-foreground">
          For a library to be considered for indexing, it should meet these criteria:
        </p>

        <div className="space-y-3">
          <RequirementItem
            met={true}
            text="Hosted on GitHub (other sources coming soon)"
          />
          <RequirementItem
            met={true}
            text="Has documentation (README, docs folder, or external docs site)"
          />
          <RequirementItem
            met={true}
            text="Actively maintained (recent commits within the last year)"
          />
          <RequirementItem
            met={true}
            text="Open source with a permissive license"
          />
          <RequirementItem
            met={true}
            text="Not already indexed (check the Explore page first)"
          />
        </div>

        <Callout type="warning" title="Not Yet Supported">
          We currently only support GitHub repositories. Support for GitLab, npm
          documentation, and external documentation sites is planned.
        </Callout>
      </section>

      {/* How to Submit */}
      <section className="mb-12">
        <h2 id="how-to-submit" className="mb-4 text-xl font-semibold text-foreground">
          How to Submit
        </h2>

        <p className="mb-4 text-muted-foreground">
          There are two ways to submit a library for indexing:
        </p>

        <h3 className="mb-3 mt-6 text-lg font-semibold text-foreground">
          Option 1: REST API
        </h3>

        <p className="mb-4 text-muted-foreground">
          Send a POST request to the submissions endpoint:
        </p>

        <CodeBlock language="bash">
{`curl -X POST "https://api.nexus.yogan.dev/api/submissions" \\
  -H "Content-Type: application/json" \\
  -d '{
    "libraryName": "zustand",
    "sourceUrl": "https://github.com/pmndrs/zustand",
    "description": "Bear necessities for state management in React",
    "email": "your@email.com"
  }'`}
        </CodeBlock>

        <p className="mt-4 text-muted-foreground">
          The email is optional but recommended if you want to be notified when
          indexing is complete.
        </p>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Option 2: GitHub Issue
        </h3>

        <p className="mb-4 text-muted-foreground">
          Open an issue on the{" "}
          <a
            href="https://github.com/yogan/nexus/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Nexus GitHub repository
          </a>{" "}
          with the following information:
        </p>

        <CodeBlock language="text">
{`Title: [Library Request] <library name>

Body:
- Library name: zustand
- GitHub URL: https://github.com/pmndrs/zustand
- Description: Bear necessities for state management in React
- Why this library? (optional): Popular React state management library`}
        </CodeBlock>
      </section>

      {/* Review Process */}
      <section className="mb-12">
        <h2 id="review-process" className="mb-4 text-xl font-semibold text-foreground">
          Review Process
        </h2>

        <p className="mb-4 text-muted-foreground">
          After submitting, your request goes through the following process:
        </p>

        <div className="space-y-4">
          <ProcessStep
            icon={<Clock className="h-5 w-5 text-blue-400" />}
            status="pending"
            title="Pending Review"
            description="Your submission is queued for review. This typically takes 1-3 days."
          />
          <ProcessStep
            icon={<CheckCircle className="h-5 w-5 text-green-400" />}
            status="approved"
            title="Approved"
            description="The library has been approved and is queued for indexing."
          />
          <ProcessStep
            icon={<AlertCircle className="h-5 w-5 text-yellow-400" />}
            status="indexing"
            title="Indexing"
            description="Documentation is being crawled, chunked, and embedded. This may take several hours."
          />
          <ProcessStep
            icon={<CheckCircle className="h-5 w-5 text-green-400" />}
            status="indexed"
            title="Indexed"
            description="The library is now available for semantic search!"
          />
        </div>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Check Submission Status
        </h3>

        <p className="mb-4 text-muted-foreground">
          You can check the status of your submission using the API:
        </p>

        <CodeBlock language="bash">
{`curl "https://api.nexus.yogan.dev/api/submissions/<submission-id>"`}
        </CodeBlock>

        <p className="mt-4 text-muted-foreground">
          Or view recent submissions on the{" "}
          <Link to="/docs/api" className="text-primary hover:underline">
            API playground
          </Link>
          .
        </p>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 id="best-practices" className="mb-4 text-xl font-semibold text-foreground">
          Best Practices
        </h2>

        <div className="space-y-4">
          <PracticeCard
            title="Check First"
            description="Search the Explore page to make sure the library isn't already indexed."
          />
          <PracticeCard
            title="Use Official Repos"
            description="Submit the official repository, not forks or mirrors."
          />
          <PracticeCard
            title="Include Description"
            description="A good description helps us understand the library's purpose."
          />
          <PracticeCard
            title="Provide Email"
            description="Include your email to be notified when indexing completes."
          />
        </div>
      </section>

      {/* Rejection Reasons */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Common Rejection Reasons
        </h2>

        <div className="space-y-3">
          <RejectionReason
            reason="Already indexed"
            solution="Check the Explore page first"
          />
          <RejectionReason
            reason="No documentation"
            solution="Library needs docs to be indexed"
          />
          <RejectionReason
            reason="Not actively maintained"
            solution="We prioritize active projects"
          />
          <RejectionReason
            reason="Private or restricted repository"
            solution="Must be publicly accessible"
          />
          <RejectionReason
            reason="Not a library/framework"
            solution="We focus on developer libraries, not applications"
          />
        </div>
      </section>
    </DocsLayout>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      {met ? (
        <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-red-400" />
      )}
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

function ProcessStep({
  icon,
  status,
  title,
  description,
}: {
  icon: React.ReactNode;
  status: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-border/50 bg-card/50 p-4">
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="rounded bg-muted/50 px-2 py-0.5 text-xs font-mono text-muted-foreground">
            {status}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PracticeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function RejectionReason({
  reason,
  solution,
}: {
  reason: string;
  solution: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
      <span className="text-foreground">{reason}</span>
      <span className="text-sm text-muted-foreground">{solution}</span>
    </div>
  );
}
