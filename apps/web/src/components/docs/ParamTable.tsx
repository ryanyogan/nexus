interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

interface ParamTableProps {
  parameters: Parameter[];
  title?: string;
}

export function ParamTable({ parameters, title }: ParamTableProps) {
  return (
    <div className="my-6">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
      )}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Parameter
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((param, index) => (
              <tr
                key={param.name}
                className={`border-b border-border/30 ${
                  index % 2 === 0 ? "bg-card/30" : "bg-card/10"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-primary">
                      {param.name}
                    </code>
                    {param.required && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-xs font-medium text-red-400">
                        required
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {param.type}
                  </code>
                  {param.default && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (default: {param.default})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {param.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
