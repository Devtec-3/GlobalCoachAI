import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ className, size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

export function AILoadingShimmer({ text = "AI is thinking..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative h-6 w-6 animate-pulse rounded-full bg-primary/40" />
      </div>
      <div className="flex-1">
        <div className="mb-2 h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-48 animate-pulse rounded bg-muted/60" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted/60" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border bg-card p-6">
          <div className="mb-2 h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="mb-1 h-10 w-16 animate-pulse rounded bg-muted/60" />
          <div className="h-3 w-24 animate-pulse rounded bg-muted/40" />
        </div>
      ))}
    </div>
  );
}
