import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6"
        >
          <Button
            asChild
            className="h-11 px-6 rounded-xl font-bold border-0 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              color: "#ffffff",
              boxShadow: "0 4px 18px rgba(245, 158, 11, 0.25)",
            }}
          >
            <Link to={actionLink} style={{ textDecoration: "none", color: "#ffffff" }}>
              {actionText}
            </Link>
          </Button>
        </motion.div>
      );
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6"
      >
        <Button
          onClick={onAction}
          className="h-11 px-6 rounded-xl font-bold border-0 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #EA580C)",
            color: "#ffffff",
            boxShadow: "0 4px 18px rgba(245, 158, 11, 0.25)",
          }}
        >
          {actionText}
        </Button>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden w-full flex flex-col items-center justify-center"
      style={{
        textAlign: "center",
        padding: "56px 24px",
        background: "linear-gradient(180deg, #ffffff 0%, #FAF9F6 100%)",
        borderRadius: 24,
        border: "1px solid rgba(15, 10, 30, 0.05)",
        boxShadow: "0 10px 30px rgba(15, 10, 30, 0.02)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Subtle radial ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: "radial-gradient(circle at center, #F59E0B 0%, transparent 60%)",
        }}
      />

      {/* Layered glowing badge container */}
      <div className="relative mb-5 flex items-center justify-center h-20 w-20">
        {/* Outer dashed spinning/concentric border */}
        <motion.div
          className="absolute inset-0 rounded-full border border-dashed border-amber-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        {/* Middle decorative soft ring */}
        <div className="absolute inset-2.5 rounded-full bg-amber-500/5 blur-sm" />
        
        {/* Inner solid badge with shadow */}
        <motion.div
          className="relative w-12 h-12 rounded-[14px] bg-amber-50 border border-amber-100 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.06)]"
          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Icon className="h-5.5 w-5.5 text-amber-600" strokeWidth={1.8} />
        </motion.div>
      </div>

      {/* Main text */}
      <h3
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      
      {/* Secondary text */}
      <p
        style={{
          marginTop: 8,
          marginBottom: 0,
          fontSize: 14,
          color: "rgba(15, 10, 30, 0.45)",
          lineHeight: 1.55,
          maxWidth: 320,
        }}
      >
        {description}
      </p>

      {renderButton()}
    </motion.div>
  );
}

