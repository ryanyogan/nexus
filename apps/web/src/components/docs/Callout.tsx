import { Info, Lightbulb, AlertTriangle, AlertCircle } from "lucide-react";

type CalloutType = "info" | "tip" | "warning" | "danger";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  info: {
    icon: <Info className="h-5 w-5" />,
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    titleColor: "text-blue-400",
  },
  tip: {
    icon: <Lightbulb className="h-5 w-5" />,
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    iconColor: "text-green-400",
    titleColor: "text-green-400",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    titleColor: "text-yellow-400",
  },
  danger: {
    icon: <AlertCircle className="h-5 w-5" />,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
    titleColor: "text-red-400",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];

  return (
    <div
      className={`my-6 rounded-lg border ${config.borderColor} ${config.bgColor} p-4`}
    >
      <div className="flex gap-3">
        <div className={`shrink-0 ${config.iconColor}`}>{config.icon}</div>
        <div className="flex-1">
          {title && (
            <h4 className={`mb-1 font-semibold ${config.titleColor}`}>
              {title}
            </h4>
          )}
          <div className="text-sm text-foreground/90">{children}</div>
        </div>
      </div>
    </div>
  );
}
