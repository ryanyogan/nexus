import { Info, Lightbulb, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

type CalloutType = "info" | "tip" | "warning" | "danger" | "success";

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
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    borderColor: "border-blue-200 dark:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-700 dark:text-blue-400",
  },
  tip: {
    icon: <Lightbulb className="h-5 w-5" />,
    bgColor: "bg-green-50 dark:bg-green-500/10",
    borderColor: "border-green-200 dark:border-green-500/30",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-700 dark:text-green-400",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: "bg-amber-50 dark:bg-yellow-500/10",
    borderColor: "border-amber-200 dark:border-yellow-500/30",
    iconColor: "text-amber-600 dark:text-yellow-400",
    titleColor: "text-amber-700 dark:text-yellow-400",
  },
  danger: {
    icon: <AlertCircle className="h-5 w-5" />,
    bgColor: "bg-red-50 dark:bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-500/30",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-700 dark:text-red-400",
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    titleColor: "text-emerald-700 dark:text-emerald-400",
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
