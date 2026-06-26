import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Detect success vs error vs info using variant and title text keywords
        const isSuccess = variant === "success" || 
                          title?.toLowerCase().includes("success") || 
                          title?.toLowerCase().includes("sent") || 
                          title?.toLowerCase().includes("updated") || 
                          title?.toLowerCase().includes("done") || 
                          title?.toLowerCase().includes("saved") || 
                          title?.toLowerCase().includes("successful") || 
                          description?.toLowerCase().includes("success");
                          
        const isDestructive = variant === "destructive" || 
                              title?.toLowerCase().includes("fail") || 
                              title?.toLowerCase().includes("error") ||
                              description?.toLowerCase().includes("fail") ||
                              description?.toLowerCase().includes("error");

        let icon = <Info className="h-5 w-5 text-amber-500" />;
        let iconBg = "rgba(245, 158, 11, 0.08)";
        let leftBorderColor = "#F59E0B";

        if (isSuccess) {
          icon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
          iconBg = "rgba(16, 185, 129, 0.08)";
          leftBorderColor = "#10B981";
        } else if (isDestructive) {
          icon = <AlertCircle className="h-5 w-5 text-rose-500" />;
          iconBg = "rgba(244, 63, 94, 0.08)";
          leftBorderColor = "#E11D48";
        }

        return (
          <Toast
            key={id}
            variant={variant}
            {...props}
            style={{
              background: "rgba(255, 255, 255, 0.88)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(15, 10, 30, 0.06)",
              borderLeft: `4px solid ${leftBorderColor}`,
              borderRadius: 14,
              padding: "14px 18px",
              boxShadow: "0 12px 32px rgba(15, 10, 30, 0.06), 0 2px 8px rgba(15, 10, 30, 0.02)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Left Status Icon Wrapper */}
            <div
              style={{
                height: 36,
                width: 36,
                borderRadius: 10,
                background: iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {icon}
            </div>

            {/* Typography content */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {title && (
                <ToastTitle style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: 0, padding: 0 }}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription style={{ fontSize: 12.5, color: "#64748b", fontWeight: 450, margin: 0, padding: 0 }}>
                  {description}
                </ToastDescription>
              )}
            </div>

            {action}
            <ToastClose style={{ position: "relative", right: 0, top: 0, opacity: 0.6 }} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
