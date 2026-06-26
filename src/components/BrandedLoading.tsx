import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom premium CSS styles injected into the document head
const loadingStyles = `
  @keyframes jl-logo-pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.25), 0 0 0 0px rgba(245, 158, 11, 0.1);
    }
    50% {
      transform: scale(1.06);
      box-shadow: 0 10px 32px rgba(245, 158, 11, 0.45), 0 0 0 10px rgba(245, 158, 11, 0);
    }
  }

  @keyframes jl-glow-shimmer {
    0%, 100% {
      filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 6px rgba(245, 158, 11, 0.4));
    }
    50% {
      filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 14px rgba(245, 158, 11, 0.8));
    }
  }

  @keyframes jl-skeleton-pulse {
    0%, 100% {
      background-position: 0% 50%;
      opacity: 0.6;
    }
    50% {
      background-position: 100% 50%;
      opacity: 0.95;
    }
  }

  .jl-skeleton-item {
    background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
    background-size: 200% 100%;
    animation: jl-skeleton-pulse 1.8s infinite ease-in-out;
  }

  .jl-logo-anim {
    animation: jl-logo-pulse 2.2s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }

  .jl-zap-anim {
    animation: jl-glow-shimmer 2.2s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

// Helper to inject styles once
if (typeof document !== "undefined") {
  const styleId = "jlindo-loading-styles";
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.innerHTML = loadingStyles;
    document.head.appendChild(styleEl);
  }
}

const DEFAULT_MESSAGES = [
  "Finding opportunities near you...",
  "Loading your applications...",
  "Preparing your workspace...",
  "Securing your connection...",
  "Polishing details..."
];

interface BrandedLoadingScreenProps {
  message?: string;
  customMessages?: string[];
}

/**
 * 1. Global full-page loading screen with animated branded logo and smooth cycling loading messages.
 */
export function BrandedLoadingScreen({ message, customMessages }: BrandedLoadingScreenProps) {
  const messagesList = customMessages || DEFAULT_MESSAGES;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (message) return; // Keep static message if provided
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messagesList.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [message, messagesList]);

  const activeMessage = message || messagesList[msgIndex];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at center, #ffffff 0%, #FFF7ED 60%, #F8FAFC 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, maxWidth: 320, textAlign: "center" }}>
        
        {/* Animated Branded Logo Container */}
        <motion.div
          className="jl-logo-anim"
          style={{
            height: 72,
            width: 72,
            borderRadius: 20,
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 28px rgba(245,158,11,0.30)",
            flexShrink: 0,
          }}
        >
          {/* Pure path J lettermark */}
          <svg width="44" height="44" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* J vertical stem */}
            <rect x="10" y="1" width="5" height="13" rx="2.5" fill="white"/>
            {/* J hook at bottom */}
            <path d="M10 12 Q10 17.5 5 17.5 Q2.5 17.5 2 16" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>
        </motion.div>

        {/* Brand Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#0d0a1e", letterSpacing: "-0.03em" }}>
            Jlindo
          </span>
          
          {/* Animated Message Transition */}
          <div style={{ height: 20, position: "relative" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeMessage}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                  display: "block",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "rgba(15,10,30,0.45)",
                  whiteSpace: "nowrap"
                }}
              >
                {activeMessage}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

interface BrandedLoadingStateProps {
  message?: string;
  minHeight?: number | string;
}

/**
 * 2. Localized branded loading state for inline components or container cards.
 */
export function BrandedLoadingState({ message = "Updating workspace...", minHeight = 240 }: BrandedLoadingStateProps) {
  return (
    <div
      style={{
        width: "100%",
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.4)",
        borderRadius: 24,
        border: "1px solid rgba(15,10,30,0.04)",
        backdropFilter: "blur(4px)",
        padding: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {/* Compact Logo */}
        <div
          className="jl-logo-anim"
          style={{
            height: 48,
            width: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* J lettermark */}
          <svg width="26" height="26" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="1" width="5" height="13" rx="2.5" fill="white"/>
            <path d="M10 12 Q10 17.5 5 17.5 Q2.5 17.5 2 16" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 550, color: "rgba(15,10,30,0.45)" }}>
          {message}
        </span>
      </div>
    </div>
  );
}

/**
 * 3. Skeleton card structure matching the newly designed Airbnb/Linear style card.
 */
export function JobCardSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid rgba(15,10,30,0.04)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Top row skeleton (Title & Status) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div className="jl-skeleton-item" style={{ height: 18, width: "60%", borderRadius: 6 }} />
        <div className="jl-skeleton-item" style={{ height: 18, width: 60, borderRadius: 6 }} />
      </div>

      {/* Meta Row skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div className="jl-skeleton-item" style={{ height: 13, width: 70, borderRadius: 4 }} />
        <span style={{ color: "rgba(15,10,30,0.15)" }}>•</span>
        <div className="jl-skeleton-item" style={{ height: 13, width: 90, borderRadius: 4 }} />
      </div>

      {/* Description lines skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="jl-skeleton-item" style={{ height: 12, width: "100%", borderRadius: 4 }} />
        <div className="jl-skeleton-item" style={{ height: 12, width: "85%", borderRadius: 4 }} />
      </div>

      {/* Bottom Row skeleton (Salary & CTA) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 4,
          paddingTop: 16,
          borderTop: "1px solid rgba(15,10,30,0.04)",
        }}
      >
        <div className="jl-skeleton-item" style={{ height: 16, width: 80, borderRadius: 4 }} />
        <div className="jl-skeleton-item" style={{ height: 14, width: 60, borderRadius: 4 }} />
      </div>
    </div>
  );
}

interface PageSkeletonProps {
  cardsCount?: number;
}

/**
 * Full page list loader placeholder with header skeletons.
 */
export function PageSkeleton({ cardsCount = 3 }: PageSkeletonProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px 60px" }}>
        
        {/* Header Skeletons */}
        <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="jl-skeleton-item" style={{ height: 12, width: 80, borderRadius: 4 }} />
          <div className="jl-skeleton-item" style={{ height: 26, width: "45%", borderRadius: 8, marginTop: 4 }} />
          <div className="jl-skeleton-item" style={{ height: 14, width: "65%", borderRadius: 6, marginTop: 2 }} />
        </div>

        {/* Search Bar Skeleton */}
        <div className="jl-skeleton-item" style={{ height: 50, borderRadius: 14, marginBottom: 28 }} />

        {/* Card Grid Skeletons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: cardsCount }).map((_, idx) => (
            <JobCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
