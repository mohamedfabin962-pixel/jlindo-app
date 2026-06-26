

interface JlindoLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "color" | "white";
  showTagline?: boolean;
}

/** Reusable Jlindo brand logo + optional tagline */
export function JlindoLogo({
  size = "md",
  variant = "color",
  showTagline = false,
}: JlindoLogoProps) {
  const iconSizes = { sm: 26, md: 32, lg: 48 };
  const textSizes = { sm: 13, md: 15, lg: 20 };
  const taglineSizes = { sm: 9, md: 10.5, lg: 13 };
  const iconSize = iconSizes[size];
  const textSize = textSizes[size];
  const taglineSize = taglineSizes[size];

  const brandColor = variant === "white" ? "rgba(255,255,255,0.90)" : "#0d0a1e";
  const taglineColor = variant === "white" ? "rgba(255,255,255,0.55)" : "rgba(15,10,30,0.45)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Icon mark */}
      <div
        style={{
          height: iconSize,
          width: iconSize,
          borderRadius: Math.round(iconSize * 0.28),
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 10px rgba(245,158,11,0.30)",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pure path J lettermark — no font dependency */}
        <svg
          width={iconSize * 0.62}
          height={iconSize * 0.62}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* J vertical stem */}
          <rect x="10" y="1" width="5" height="13" rx="2.5" fill="white"/>
          {/* J hook at bottom */}
          <path d="M10 12 Q10 17.5 5 17.5 Q2.5 17.5 2 16" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      {/* Brand name + optional tagline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <span
          style={{
            fontSize: textSize,
            fontWeight: 800,
            color: brandColor,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Jlindo
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: taglineSize,
              fontWeight: 500,
              color: taglineColor,
              letterSpacing: "0.01em",
              lineHeight: 1.3,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Find Work Near You
          </span>
        )}
      </div>
    </div>
  );
}
