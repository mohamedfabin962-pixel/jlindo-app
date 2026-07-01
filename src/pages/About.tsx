import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Zap,
  ClipboardList,
  User,
  ArrowRight,
  Sparkles,
  Globe,
  Heart,
  Rocket,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { JlindoLogo } from "@/components/JlindoLogo";

/* ─── Animation variants ─────────────────────────── */
const fadeUp: any = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
};

const staggerParent: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ─── Features data ──────────────────────────────── */
const features = [
  {
    icon: MapPin,
    title: "Find Nearby Jobs",
    description:
      "Discover opportunities in your area instantly. Filter by location, category, and pay to find work that fits your life.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    icon: Zap,
    title: "Easy Application",
    description:
      "Apply to any job in seconds with your saved profile. No lengthy forms, no friction — just opportunity at your fingertips.",
    color: "#6366F1",
    bg: "rgba(99,102,241,0.08)",
  },
  {
    icon: ClipboardList,
    title: "Application Tracking",
    description:
      "Stay on top of every application with real-time status updates. Know exactly where you stand, every step of the way.",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    icon: User,
    title: "Profile Management",
    description:
      "Build a professional profile that showcases your skills and experience. Make yourself stand out to the right employers.",
    color: "#EC4899",
    bg: "rgba(236,72,153,0.08)",
  },
];

/* ─── Stats ──────────────────────────────────────── */
const stats = [
  { value: "10K+", label: "Workers placed" },
  { value: "500+", label: "Partner employers" },
  { value: "50+", label: "Cities covered" },
  { value: "95%", label: "Satisfaction rate" },
];

/* ─── Vision pillars ─────────────────────────────── */
const visionPillars = [
  { icon: Globe, text: "Expand to every major city across the country" },
  { icon: Sparkles, text: "AI-powered job matching for perfect-fit roles" },
  { icon: Heart, text: "Build the most worker-centric platform ever made" },
  { icon: Rocket, text: "Launch employer tools that hire 10× faster" },
];

/* ════════════════════════════════════════════════════
   About page
════════════════════════════════════════════════════ */
export default function About() {
  const { user, profile } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(170deg, #F8FAFC 0%, #FFF7ED 40%, #F8FAFC 100%)",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ════ AMBIENT GLOWS ════════════════════════ */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}
      >
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-100px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,158,11,0.11) 0%, transparent 65%)",
            filter: "blur(1px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-150px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        
        {/* Admin Back Navigation */}
        {profile?.role === "admin" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-white hover:text-amber-600 hover:border-amber-200 border border-slate-200/80 rounded-full transition-all duration-300 shadow-sm hover:shadow"
              style={{ textDecoration: "none" }}
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Admin Portal
            </div>
          </div>
        )}

        {/* ════ HERO ════════════════════════════════ */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(64px,10vw,120px) 24px clamp(56px,8vw,96px)",
            textAlign: "center",
          }}
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(245,158,11,0.10)",
                border: "1px solid rgba(245,158,11,0.20)",
              }}
            >
              <div
                style={{
                  height: 6,
                  width: 6,
                  borderRadius: "50%",
                  background: "#F59E0B",
                  boxShadow: "0 0 0 3px rgba(245,158,11,0.25)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#D97706",
                }}
              >
                Our Story
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
            style={{
              margin: "0 0 20px",
              fontSize: "clamp(38px, 6.5vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              color: "#0d0a1e",
            }}
          >
            Connecting Workers{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 55%, #EA580C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              with Opportunities
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            style={{
              margin: "0 auto 40px",
              maxWidth: 620,
              fontSize: "clamp(15px, 2vw, 18px)",
              fontWeight: 400,
              lineHeight: 1.65,
              color: "rgba(15,10,30,0.55)",
            }}
          >
            Jlindo is the platform that bridges the gap between skilled workers and
            local employers — making it effortless to find work, apply in moments,
            and build a career you're proud of.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link
              to={user ? "/jobs" : "/signup"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 26px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#1c0e00",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(245,158,11,0.30)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(245,158,11,0.38)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(245,158,11,0.30)";
              }}
            >
              {user ? "Browse Jobs" : "Get Started Free"}
              <ArrowRight style={{ height: 16, width: 16 }} />
            </Link>
            {!user && (
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 26px",
                  borderRadius: 12,
                  background: "transparent",
                  color: "rgba(15,10,30,0.65)",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  border: "1px solid rgba(15,10,30,0.12)",
                  transition: "border-color 0.15s, color 0.15s",
                }}
              >
                Sign In
              </Link>
            )}
          </motion.div>
        </section>

        {/* ════ STATS BAR ═══════════════════════════ */}
        <motion.section
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          style={{
            maxWidth: 900,
            margin: "0 auto 80px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 2,
              background: "rgba(15,10,30,0.05)",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid rgba(15,10,30,0.06)",
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={fadeUp}
                style={{
                  padding: "28px 20px",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(28px, 4vw, 40px)",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(15,10,30,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ════ MISSION ══════════════════════════════ */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto 96px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 40,
              alignItems: "center",
            }}
          >
            {/* Left — text */}
            <motion.div
              variants={staggerParent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.div custom={0} variants={fadeUp}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 14px",
                    borderRadius: 999,
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    marginBottom: 20,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#6366F1",
                    }}
                  >
                    Our Mission
                  </span>
                </div>
              </motion.div>

              <motion.h2
                custom={1}
                variants={fadeUp}
                style={{
                  margin: "0 0 16px",
                  fontSize: "clamp(28px, 3.5vw, 42px)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "#0d0a1e",
                }}
              >
                Work shouldn't be
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  hard to find.
                </span>
              </motion.h2>

              <motion.p
                custom={2}
                variants={fadeUp}
                style={{
                  margin: "0 0 24px",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "rgba(15,10,30,0.55)",
                }}
              >
                Every worker deserves easy access to nearby opportunities. Jlindo was
                built with one goal: to remove every barrier between a skilled person
                and a good job. No confusing portals, no long waits — just a simple,
                fast, and human experience.
              </motion.p>

              <motion.p
                custom={3}
                variants={fadeUp}
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "rgba(15,10,30,0.55)",
                }}
              >
                We believe local work powers local communities. By connecting employers
                and workers in the same neighbourhood, we're not just filling vacancies —
                we're strengthening the economic fabric of every city we operate in.
              </motion.p>
            </motion.div>

            {/* Right — visual card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: 28,
                  overflow: "hidden",
                  background: "linear-gradient(145deg, #0d0a1e 0%, #1a1440 100%)",
                  padding: "36px 32px",
                  boxShadow: "0 24px 64px rgba(13,10,30,0.15), 0 1px 0 rgba(255,255,255,0.04) inset",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Glow inside card */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -40,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <JlindoLogo size="md" variant="white" showTagline />

                <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    "Remove barriers to employment",
                    "Empower every type of worker",
                    "Support local economies",
                    "Make hiring instant and human",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 6,
                          background: "rgba(245,158,11,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 style={{ height: 12, width: 12, color: "#F59E0B" }} />
                      </div>
                      <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════ FEATURES ════════════════════════════ */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto 96px",
            padding: "0 24px",
          }}
        >
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true, margin: "-60px" }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#10B981",
                }}
              >
                Features
              </span>
            </div>
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "clamp(26px, 3.5vw, 42px)",
                fontWeight: 900,
                letterSpacing: "-0.025em",
                color: "#0d0a1e",
                lineHeight: 1.1,
              }}
            >
              Everything you need to{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                succeed
              </span>
            </h2>
            <p
              style={{
                margin: "0 auto",
                maxWidth: 520,
                fontSize: 15,
                lineHeight: 1.65,
                color: "rgba(15,10,30,0.50)",
              }}
            >
              A complete toolkit designed to help workers find opportunities and
              employers discover talent — all in one place.
            </p>
          </motion.div>

          {/* Feature cards grid */}
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                custom={i}
                variants={fadeUp}
                style={{
                  padding: "28px 24px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.80)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(15,10,30,0.07)",
                  boxShadow: "0 4px 20px rgba(15,10,30,0.04)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 12px 32px rgba(15,10,30,0.10)",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    height: 48,
                    width: 48,
                    borderRadius: 14,
                    background: feat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  <feat.icon style={{ height: 22, width: 22, color: feat.color }} />
                </div>

                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0d0a1e",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feat.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    color: "rgba(15,10,30,0.50)",
                  }}
                >
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ════ VISION ══════════════════════════════ */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto 96px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              borderRadius: 32,
              background: "linear-gradient(145deg, #0d0a1e 0%, #1e1560 100%)",
              padding: "clamp(40px,6vw,72px) clamp(28px,5vw,64px)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(13,10,30,0.18)",
            }}
          >
            {/* Decorative ambient glows inside card */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -80,
                right: -60,
                width: 360,
                height: 360,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(245,158,11,0.20) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: -60,
                left: -60,
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 48,
                alignItems: "center",
              }}
            >
              {/* Left text */}
              <motion.div
                initial={{ opacity: 0, x: -32 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-60px" }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 14px",
                    borderRadius: 999,
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    marginBottom: 20,
                  }}
                >
                  <Rocket style={{ height: 12, width: 12, color: "#F59E0B" }} />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#F59E0B",
                    }}
                  >
                    Our Vision
                  </span>
                </div>

                <h2
                  style={{
                    margin: "0 0 16px",
                    fontSize: "clamp(26px, 3.5vw, 40px)",
                    fontWeight: 900,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.1,
                    color: "#ffffff",
                  }}
                >
                  Building the future
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    of local work.
                  </span>
                </h2>

                <p
                  style={{
                    margin: "0 0 28px",
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.55)",
                    maxWidth: 380,
                  }}
                >
                  We're just getting started. Jlindo's vision is to become the definitive
                  platform for local employment across the country — powered by smart
                  technology and a genuine care for people's livelihoods.
                </p>

                <Link
                  to={user ? "/jobs" : "/signup"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 24px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#1c0e00",
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(245,158,11,0.28)",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)")
                  }
                >
                  {user ? "Explore Jobs" : "Join Jlindo Today"}
                  <ArrowRight style={{ height: 15, width: 15 }} />
                </Link>
              </motion.div>

              {/* Right — pillars */}
              <motion.div
                variants={staggerParent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {visionPillars.map((p, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      style={{
                        height: 38,
                        width: 38,
                        borderRadius: 10,
                        background: "rgba(245,158,11,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <p.icon style={{ height: 18, width: 18, color: "#F59E0B" }} />
                    </div>
                    <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.78)", fontWeight: 500 }}>
                      {p.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════ FOOTER ═══════════════════════════════ */}
        <footer
          style={{
            borderTop: "1px solid rgba(15,10,30,0.07)",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <JlindoLogo size="sm" variant="color" showTagline={false} />
            <p style={{ margin: 0, fontSize: 12.5, color: "rgba(15,10,30,0.38)", fontWeight: 500 }}>
              © 2025 Jlindo · Made with{" "}
              <Heart
                style={{ height: 11, width: 11, display: "inline", color: "#F59E0B", verticalAlign: "middle" }}
                fill="#F59E0B"
              />{" "}
              for workers everywhere
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Home", to: "/" },
                ...(user ? [] : [
                  { label: "Sign Up", to: "/signup" },
                  { label: "Log In", to: "/login" },
                ])
              ].map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "rgba(15,10,30,0.40)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "#D97706")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(15,10,30,0.40)")
                  }
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
