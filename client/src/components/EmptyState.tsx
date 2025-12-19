import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, ClipboardList, Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: "cv" | "jobs" | "applications" | "ai";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const icons = {
  cv: FileText,
  jobs: Briefcase,
  applications: ClipboardList,
  ai: Sparkles,
};

export function EmptyState({
  icon = "ai",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="button-empty-state-action">
          <Sparkles className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
