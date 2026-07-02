import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Info, Sparkles, RefreshCw, Clock, AlertTriangle, Wrench, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


interface Notification {
  id: string;
  title: string;
  message: string;
  priority: "info" | "feature" | "update" | "reminder" | "important" | "maintenance";
  target_audience: "workers" | "employers" | "everyone";
  created_at: string;
  created_by?: string;
  creator_name?: string;
}

const PRIORITY_CONFIG = {
  info: {
    bg: "#EFF6FF",
    border: "rgba(59,130,246,0.15)",
    color: "#2563EB",
    icon: Info,
    label: "Info",
  },
  feature: {
    bg: "#FAF5FF",
    border: "rgba(168,85,247,0.15)",
    color: "#8B5CF6",
    icon: Sparkles,
    label: "Feature",
  },
  update: {
    bg: "#ECFDF5",
    border: "rgba(16,185,129,0.15)",
    color: "#10B981",
    icon: RefreshCw,
    label: "Update",
  },
  reminder: {
    bg: "#FFFBEB",
    border: "rgba(245,158,11,0.15)",
    color: "#D97706",
    icon: Clock,
    label: "Reminder",
  },
  important: {
    bg: "#FEF2F2",
    border: "rgba(239,68,68,0.15)",
    color: "#EF4444",
    icon: AlertTriangle,
    label: "Important",
  },
  maintenance: {
    bg: "#F8FAFC",
    border: "rgba(100,116,139,0.15)",
    color: "#64748B",
    icon: Wrench,
    label: "Maintenance",
  },
};

export function NotificationBell() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  const fetchNotifications = async () => {
    if (!user || !profile) return;
    try {
      const audience = profile.role === "worker" ? "workers" : "employers";
      const { data: notifs, error: notifErr } = await supabase
        .from("notifications")
        .select(`
          id, title, message, priority, target_audience, created_at, created_by,
          profiles:created_by ( full_name )
        `)
        .or(`target_audience.eq.everyone,target_audience.eq.${audience}`)
        .order("created_at", { ascending: false });

      if (notifErr) throw notifErr;

      const formattedNotifs = (notifs || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        priority: n.priority,
        target_audience: n.target_audience,
        created_at: n.created_at,
        created_by: n.created_by,
        creator_name: n.profiles?.full_name || "System Admin",
      }));

      setNotifications(formattedNotifs);

      const { data: reads, error: readsErr } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user.id);

      if (readsErr) throw readsErr;
      setReadIds((reads || []).map((r) => r.notification_id));
    } catch (err: any) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("public-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.role]);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && notifications.length > 0 && user) {
      const unreadNotifs = notifications.filter((n) => !readIds.includes(n.id));
      if (unreadNotifs.length > 0) {
        try {
          const newReads = unreadNotifs.map((n) => ({
            notification_id: n.id,
            user_id: user.id,
          }));

          const { error } = await supabase.from("notification_reads").insert(newReads);
          if (error) throw error;

          setReadIds((prev) => [...prev, ...unreadNotifs.map((n) => n.id)]);
        } catch (err: any) {
          console.error("Failed to mark notifications as read:", err);
        }
      }
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const sortedNotifications = [...notifications].sort((a, b) => {
    const aUnread = !readIds.includes(a.id);
    const bUnread = !readIds.includes(b.id);
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={handleToggle}
        style={{
          background: "none",
          border: "none",
          padding: 8,
          borderRadius: 10,
          cursor: "pointer",
          color: isOpen ? "#0d0a1e" : "rgba(15,10,30,0.52)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "all 0.15s ease",
        }}
        className="hover:bg-slate-100/80"
        aria-label="Notifications"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-[swing_1s_ease-in-out_infinite]" : ""} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "#EF4444",
              color: "#ffffff",
              fontSize: 9,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 0 0 2px #fff",
              lineHeight: 1,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 90,
                background: "transparent",
                cursor: "default",
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 360,
                maxWidth: "calc(100vw - 32px)",
                background: "#ffffff",
                border: "1px solid rgba(15, 10, 30, 0.08)",
                borderRadius: 16,
                boxShadow: "0 10px 30px rgba(15, 10, 30, 0.12)",
                zIndex: 100,
                overflow: "hidden",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(15, 10, 30, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(248,250,252,0.5)",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#0f172a" }}>
                    Notifications
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(15, 10, 30, 0.45)" }}>
                    {unreadCount} unread message{unreadCount !== 1 && "s"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  maxHeight: 360,
                  overflowY: "auto",
                  padding: "8px 0",
                }}
              >
                {sortedNotifications.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "rgba(15,10,30,0.35)",
                    }}
                  >
                    <Bell size={28} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                      All caught up!
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11 }}>
                      No notifications to show right now.
                    </p>
                  </div>
                ) : (
                  sortedNotifications.map((notif) => {
                    const isUnread = !readIds.includes(notif.id);
                    const config = PRIORITY_CONFIG[notif.priority] || PRIORITY_CONFIG.info;
                    const IconComp = config.icon;

                    return (
                      <div
                        key={notif.id}
                        style={{
                          padding: "12px 20px",
                          display: "flex",
                          gap: 12,
                          background: isUnread ? "rgba(245,158,11,0.025)" : "transparent",
                          borderLeft: `3px solid ${isUnread ? "#F59E0B" : "transparent"}`,
                          transition: "all 0.15s ease",
                          cursor: "default",
                        }}
                        className="hover:bg-slate-50/50"
                      >
                        <div
                          style={{
                            flexShrink: 0,
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: config.bg,
                            border: `1px solid ${config.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 2,
                          }}
                        >
                          <IconComp size={15} color={config.color} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                color: config.color,
                              }}
                            >
                              {config.label}
                            </span>
                            <span
                              style={{
                                fontSize: 10.5,
                                color: "rgba(15,10,30,0.38)",
                                fontWeight: 500,
                              }}
                            >
                              {new Date(notif.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <h4
                            style={{
                              margin: "2px 0 0",
                              fontSize: 13,
                              fontWeight: isUnread ? 700 : 600,
                              color: "#0f172a",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {notif.title}
                          </h4>

                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: 12,
                              color: "rgba(15,10,30,0.58)",
                              lineHeight: 1.45,
                            }}
                          >
                            {notif.message}
                          </p>

                          <div
                            style={{
                              marginTop: 6,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 10,
                              color: "rgba(15,10,30,0.35)",
                              fontWeight: 600,
                            }}
                          >
                            <span>By {notif.creator_name}</span>
                            {isUnread && (
                              <>
                                <span>•</span>
                                <span style={{ color: "#F59E0B", display: "flex", alignItems: "center", gap: 3 }}>
                                  <Circle size={5} fill="#F59E0B" stroke="none" /> New
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
