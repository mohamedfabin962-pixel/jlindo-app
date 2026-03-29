import { cn } from "@/lib/utils";

type StatusType = "open" | "filled" | "blocked" | "pending" | "accepted" | "rejected";

const statusStyles: Record<StatusType, string> = {
  open: "bg-green-100 text-green-700",
  filled: "bg-gray-200 text-gray-600",
  blocked: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
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
