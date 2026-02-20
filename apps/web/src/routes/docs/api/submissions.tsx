import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { ApiEndpoint } from "../../../components/docs/ApiEndpoint";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/api/submissions")({
  component: SubmissionsApiDocs,
});

function SubmissionsApiDocs() {
  const toc = [
    { id: "submit", title: "Submit Library", level: 2 },
    { id: "list", title: "List Submissions", level: 2 },
    { id: "get-status", title: "Get Status", level: 2 },
  ];

  return (
    <DocsLayout
      title="Submissions API"
      description="Endpoints for submitting libraries for indexing"
      toc={toc}
    >
      {/* Submit Library */}
      <section className="mb-12">
        <h2 id="submit" className="mb-4 text-xl font-semibold text-foreground">
          Submit Library
        </h2>

        <p className="mb-4 text-muted-foreground">
          Submit a library for indexing. Currently only GitHub repositories are
          supported as documentation sources.
        </p>

        <ApiEndpoint
          method="POST"
          path="/api/submissions"
          description="Submit a new library for indexing. Returns a submission ID for tracking."
          requestBody={{
            description: "Library details",
            example: `{
  "libraryName": "zustand",
  "sourceUrl": "https://github.com/pmndrs/zustand",
  "description": "Bear necessities for state management in React",
  "email": "your@email.com"
}`,
          }}
          response={{
            description: "Returns the submission ID and status",
            example: `{
  "message": "Submission received! We'll review it soon.",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}`,
          }}
        />

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Request Fields
        </h3>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Field</th>
                <th className="px-4 py-3 text-left font-semibold">Required</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-primary">libraryName</td>
                <td className="px-4 py-3 text-green-400">Yes</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Name of the library (max 100 characters)
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3 font-mono text-primary">sourceUrl</td>
                <td className="px-4 py-3 text-green-400">Yes</td>
                <td className="px-4 py-3 text-muted-foreground">
                  GitHub repository URL
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-primary">description</td>
                <td className="px-4 py-3 text-muted-foreground">No</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Brief description (max 500 characters)
                </td>
              </tr>
              <tr className="bg-card/10">
                <td className="px-4 py-3 font-mono text-primary">email</td>
                <td className="px-4 py-3 text-muted-foreground">No</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Email for notifications when indexing completes
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="warning" title="Duplicate Submissions">
          If the repository has already been submitted, you'll receive a 409 response
          with the existing submission ID and status.
        </Callout>
      </section>

      {/* List Submissions */}
      <section className="mb-12">
        <h2 id="list" className="mb-4 text-xl font-semibold text-foreground">
          List Submissions
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/submissions"
          description="List recent submissions. Useful for seeing what libraries have been requested."
          parameters={[
            {
              name: "status",
              type: "string",
              description: "Filter by status: pending, approved, rejected, indexed",
            },
            {
              name: "limit",
              type: "number",
              default: "10",
              description: "Number of results (1-50)",
            },
            {
              name: "offset",
              type: "number",
              default: "0",
              description: "Offset for pagination",
            },
          ]}
          response={{
            description: "Returns a paginated list of submissions",
            example: `{
  "submissions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "libraryName": "zustand",
      "sourceUrl": "https://github.com/pmndrs/zustand",
      "status": "pending",
      "createdAt": "2024-01-20T10:00:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "libraryName": "jotai",
      "sourceUrl": "https://github.com/pmndrs/jotai",
      "status": "indexed",
      "createdAt": "2024-01-19T15:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 25,
    "hasMore": true
  }
}`,
          }}
        />
      </section>

      {/* Get Status */}
      <section className="mb-12">
        <h2 id="get-status" className="mb-4 text-xl font-semibold text-foreground">
          Get Submission Status
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/submissions/:id"
          description="Get the status of a specific submission."
          parameters={[
            {
              name: "id",
              type: "string",
              required: true,
              description: "The submission ID (path parameter)",
            },
          ]}
          response={{
            description: "Returns the submission details and current status",
            example: `{
  "submission": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "libraryName": "zustand",
    "sourceUrl": "https://github.com/pmndrs/zustand",
    "description": "Bear necessities for state management in React",
    "status": "indexed",
    "libraryId": "zustand",
    "createdAt": "2024-01-20T10:00:00Z",
    "processedAt": "2024-01-20T12:30:00Z"
  }
}`,
          }}
        />

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Status Values
        </h3>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-blue-400">pending</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Waiting for review
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3 font-mono text-green-400">approved</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Approved and queued for indexing
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-green-400">indexed</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Successfully indexed and available
                </td>
              </tr>
              <tr className="bg-card/10">
                <td className="px-4 py-3 font-mono text-red-400">rejected</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Not accepted (may include reason)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsLayout>
  );
}
