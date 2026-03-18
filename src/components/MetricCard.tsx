import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  variant?: "default" | "green" | "sky" | "amber";
}

const variantStyles = {
  default: "bg-gradient-to-br from-primary/10 to-primary/5 text-primary",
  green: "bg-gradient-to-br from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400",
  sky: "bg-gradient-to-br from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400",
  amber: "bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType = "positive",
  variant = "default",
}: MetricCardProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="space-y-2 sm:space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs sm:text-sm font-medium",
                changeType === "positive" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {change} {changeType === "positive" ? "↑" : "↓"}
            </p>
          )}
        </div>
        <div className={cn("p-2 sm:p-3 rounded-xl", variantStyles[variant])}>
          <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isMobile ? "w-4 h-4" : "")} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;