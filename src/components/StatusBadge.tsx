import { cn } from "@/lib/utils";

type StatusType = "open" | "filled" | "blocked" | "pending" | "accepted" | "rejected";

const statusStyles: Record<StatusType, string> = {
  open: "bg-primary/10 text-primary",
  filled: "bg-muted text-muted-foreground",
  blocked: "bg-destructive/10 text-destructive",
  pending: "bg-accent/10 text-accent",
  accepted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase() as StatusType;
  return (
    <span
      className={cn(
        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
        statusStyles[s] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}
