import { CodeBlock } from "./CodeBlock";
import { ParamTable } from "./ParamTable";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

interface ApiEndpointProps {
  method: HttpMethod;
  path: string;
  description: string;
  parameters?: Parameter[];
  requestBody?: {
    description?: string;
    example: string;
  };
  response?: {
    description?: string;
    example: string;
  };
}

const methodColors: Record<HttpMethod, { bg: string; text: string }> = {
  GET: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  POST: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
  PUT: { bg: "bg-amber-100 dark:bg-yellow-500/20", text: "text-amber-700 dark:text-yellow-400" },
  DELETE: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-700 dark:text-red-400" },
  PATCH: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400" },
};

export function ApiEndpoint({
  method,
  path,
  description,
  parameters,
  requestBody,
  response,
}: ApiEndpointProps) {
  const colors = methodColors[method];

  return (
    <div
      className="my-8 rounded-xl border border-border/50 bg-card/50 overflow-hidden"
      style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-4 py-3">
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-bold ${colors.bg} ${colors.text}`}
        >
          {method}
        </span>
        <code className="font-mono text-sm text-foreground">{path}</code>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <p className="text-muted-foreground">{description}</p>

        {/* Parameters */}
        {parameters && parameters.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Parameters
            </h4>
            <ParamTable parameters={parameters} />
          </div>
        )}

        {/* Request Body */}
        {requestBody && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Request Body
            </h4>
            {requestBody.description && (
              <p className="mb-2 text-sm text-muted-foreground">
                {requestBody.description}
              </p>
            )}
            <CodeBlock language="json">{requestBody.example}</CodeBlock>
          </div>
        )}

        {/* Response */}
        {response && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Response
            </h4>
            {response.description && (
              <p className="mb-2 text-sm text-muted-foreground">
                {response.description}
              </p>
            )}
            <CodeBlock language="json">{response.example}</CodeBlock>
          </div>
        )}
      </div>
    </div>
  );
}
