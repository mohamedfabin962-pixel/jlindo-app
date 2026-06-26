import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionLink,
}: EmptyStateProps) {
  const renderButton = () => {
    if (!actionText) return null;

    if (actionLink) {
      return (
        <Button
          asChild
          className="h-11 px-6 rounded-xl font-bold border-0 transition-transform duration-100 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #EA580C)",
            color: "#ffffff",
            boxShadow: "0 4px 18px rgba(245, 158, 11, 0.3)",
          }}
        >
          <Link to={actionLink} style={{ textDecoration: "none" }}>{actionText}</Link>
        </Button>
      );
    }

    return (
      <Button
        onClick={onAction}
        className="h-11 px-6 rounded-xl font-bold border-0 transition-transform duration-100 active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #F59E0B, #EA580C)",
          color: "#ffffff",
          boxShadow: "0 4px 18px rgba(245, 158, 11, 0.3)",
        }}
      >
        {actionText}
      </Button>
    );
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        background: "#ffffff",
        borderRadius: 24,
        border: "1px solid rgba(15, 10, 30, 0.05)",
        boxShadow: "0 4px 20px rgba(15, 10, 30, 0.02)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          height: 64,
          width: 64,
          borderRadius: 20,
          background: "rgba(245, 158, 11, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Icon style={{ height: 26, width: 26, color: "#EA580C" }} strokeWidth={1.8} />
      </div>

      {/* Main text */}
      <h3
        style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 750,
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      
      {/* Secondary text */}
      <p
        style={{
          marginTop: 6,
          marginBottom: actionText ? 20 : 0,
          fontSize: 13.5,
          color: "rgba(15, 10, 30, 0.42)",
          lineHeight: 1.55,
          maxWidth: 290,
        }}
      >
        {description}
      </p>

      {renderButton()}
    </div>
  );
}
