import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, AlertTriangle, Info, Zap, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "info" | "warning" | "critical";
  created_at: string;
  is_active: boolean;
}

const PRIORITY_STYLES = {
  info: {
    bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
    border: "rgba(59,130,246,0.25)",
    iconBg: "rgba(59,130,246,0.12)",
    iconColor: "#2563EB",
    titleColor: "#1D4ED8",
    textColor: "#1e40af",
    closeColor: "rgba(29,78,216,0.5)",
    icon: Info,
    label: "Info",
  },
  warning: {
    bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
    border: "rgba(245,158,11,0.3)",
    iconBg: "rgba(245,158,11,0.12)",
    iconColor: "#D97706",
    titleColor: "#92400E",
    textColor: "#78350F",
    closeColor: "rgba(146,64,14,0.5)",
    icon: AlertTriangle,
    label: "Notice",
  },
  critical: {
    bg: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
    border: "rgba(239,68,68,0.3)",
    iconBg: "rgba(239,68,68,0.12)",
    iconColor: "#DC2626",
    titleColor: "#991B1B",
    textColor: "#7F1D1D",
    closeColor: "rgba(153,27,27,0.5)",
    icon: Zap,
    label: "Urgent",
  },
};

const STORAGE_KEY = "jlindo_dismissed_announcements";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissed(id: string) {
  const current = getDismissed();
  if (!current.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]));
  }
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(getDismissed());

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setAnnouncements(data as Announcement[]);
    };
    fetchAnnouncements();
  }, []);

  const visible = announcements.filter((a) => !dismissed.includes(a.id));

  const handleDismiss = (id: string) => {
    addDismissed(id);
    setDismissed((prev) => [...prev, id]);
  };

  if (visible.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <AnimatePresence>
        {visible.map((ann) => {
          const style = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.info;
          const IconComp = style.icon;
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                background: style.bg,
                borderBottom: `1px solid ${style.border}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  maxWidth: 1200,
                  margin: "0 auto",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: style.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <IconComp size={16} color={style.iconColor} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        color: style.iconColor,
                        background: style.iconBg,
                        padding: "2px 7px",
                        borderRadius: 5,
                      }}
                    >
                      {style.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: style.titleColor,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {ann.title}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 13,
                      color: style.textColor,
                      lineHeight: 1.5,
                    }}
                  >
                    {ann.message}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: style.closeColor,
                      fontWeight: 500,
                    }}
                  >
                    {new Date(ann.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismiss(ann.id)}
                  aria-label="Dismiss announcement"
                  style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 6,
                    color: style.closeColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* "Platform Announcements" label when multiple are shown */}
      {visible.length > 1 && (
        <div
          style={{
            background: "rgba(15,10,30,0.03)",
            padding: "4px 20px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "rgba(15,10,30,0.4)",
            fontWeight: 600,
          }}
        >
          <Megaphone size={11} />
          {visible.length} platform announcements
        </div>
      )}
    </div>
  );
}
