import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrandedConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function BrandedConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
}: BrandedConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(13, 10, 30, 0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Dialog Container Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 400,
              background: "#ffffff",
              borderRadius: 24,
              boxShadow: "0 24px 64px -12px rgba(15, 10, 30, 0.18), 0 8px 24px -4px rgba(15, 10, 30, 0.08)",
              border: "1px solid rgba(15, 10, 30, 0.05)",
              overflow: "hidden",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Card Content wrapper */}
            <div style={{ padding: "28px 28px 20px" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                
                {/* Icon Container */}
                <div
                  style={{
                    height: 48,
                    width: 48,
                    borderRadius: 14,
                    background: isDestructive ? "rgba(239, 68, 68, 0.08)" : "rgba(245, 158, 11, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isDestructive ? (
                    <AlertTriangle style={{ height: 22, width: 22, color: "#EF4444" }} />
                  ) : (
                    <HelpCircle style={{ height: 22, width: 22, color: "#F59E0B" }} />
                  )}
                </div>

                {/* Text Block */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 750,
                      color: "#0f172a",
                      letterSpacing: "-0.015em",
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      color: "rgba(15, 10, 30, 0.52)",
                      lineHeight: 1.55,
                    }}
                  >
                    {description}
                  </p>
                </div>

              </div>
            </div>

            {/* Actions Footer */}
            <div
              style={{
                padding: "16px 28px 28px",
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onClose}
                className="h-11 px-5 font-semibold rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 transition-all text-sm"
              >
                {cancelText}
              </Button>
              
              <Button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className="h-11 px-5 font-semibold rounded-xl text-sm transition-all"
                style={{
                  background: isDestructive ? "#EF4444" : "linear-gradient(135deg, #F59E0B, #EA580C)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: isDestructive 
                    ? "0 4px 14px rgba(239, 68, 68, 0.25)" 
                    : "0 4px 14px rgba(245, 158, 11, 0.25)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-4.5 w-4.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
