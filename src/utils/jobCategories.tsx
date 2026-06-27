
export const JOB_CATEGORIES = [
  "Shop Helper",
  "Cleaning",
  "Plumbing",
  "Electrician",
  "Delivery",
  "Construction",
  "Technician",
  "Office Assistant",
  "Sales",
  "Hospitality",
  "Driving",
  "Warehouse",
  "Security",
  "Gardening",
  "Cooking",
  "Tailoring",
  "Other"
];

export const inferCategoryFromText = (title: string, description: string): string => {
  const t = (title || "").toLowerCase();
  const d = (description || "").toLowerCase();
  
  if (t.includes("clean") || t.includes("maid") || d.includes("clean")) return "Cleaning";
  if (t.includes("plumb") || t.includes("pipe")) return "Plumbing";
  if (t.includes("electr") || t.includes("wire")) return "Electrician";
  if (t.includes("deliver") || t.includes("courier")) return "Delivery";
  if (t.includes("construct") || t.includes("build") || t.includes("labor") || t.includes("mason")) return "Construction";
  if (t.includes("repair") || t.includes("fix") || t.includes("technician") || t.includes("mechanic")) return "Technician";
  if (t.includes("office") || t.includes("admin") || t.includes("assist") || t.includes("reception")) return "Office Assistant";
  if (t.includes("sales") || t.includes("retail") || t.includes("cashier")) return "Sales";
  if (t.includes("hotel") || t.includes("host") || t.includes("hospitality")) return "Hospitality";
  if (t.includes("driver") || t.includes("drive") || t.includes("car") || t.includes("chauffeur")) return "Driving";
  if (t.includes("warehouse") || t.includes("inventory") || t.includes("stock")) return "Warehouse";
  if (t.includes("guard") || t.includes("security") || t.includes("watch")) return "Security";
  if (t.includes("garden") || t.includes("landscap") || t.includes("plant")) return "Gardening";
  if (t.includes("cook") || t.includes("chef") || t.includes("kitchen") || t.includes("baker")) return "Cooking";
  if (t.includes("tailor") || t.includes("sew") || t.includes("stitch") || t.includes("garment")) return "Tailoring";
  if (t.includes("shop helper") || t.includes("helper") || t.includes("store")) return "Shop Helper";
  
  return "Other";
};

// Returns a premium handcrafted SVG illustration matching the requested aesthetic
export const getCategoryIllustration = (category: string) => {
  switch (category) {
    case "Shop Helper":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#FEE8D6", border: "1px solid rgba(244,149,86,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L4 4H20L21 9V10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 11.1046 16.1046 12 15 12C13.8954 12 13 11.1046 13 10C13 11.1046 12.1046 12 11 12C9.89543 12 9 11.1046 9 10C9 11.1046 8.10457 12 7 12C5.89543 12 5 11.1046 5 10C5 11.1046 4.10457 12 3 12C1.89543 12 1 11.1046 1 10V9H3Z" fill="#F49556" />
            <path d="M4 12V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V12H4Z" fill="#F49556" fillOpacity="0.4" />
            <rect x="9" y="14" width="6" height="8" rx="1" fill="#FFF" />
          </svg>
        </div>
      );
    case "Cleaning":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#D1FAE5", border: "1px solid rgba(16,185,129,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L11 13" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M14.5 16.5L8.5 22.5C7.5 23.5 5 22 4.5 20.5L3.5 13.5L9.5 7.5C11 7 12.5 9.5 11.5 10.5" fill="#10B981" fillOpacity="0.8" />
            <path d="M19 13L20 16L23 17L20 18L19 21L18 18L15 17L18 16L19 13Z" fill="#34D399" />
          </svg>
        </div>
      );
    case "Plumbing":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#F3E8FF", border: "1px solid rgba(168,85,247,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4H6V8C6 11.3137 8.68629 14 12 14V11" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 4V2M12 4H15C16.1046 4 17 4.89543 17 6V7" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 14C16 15.6569 14.6569 17 13 17C11.3431 17 10 15.6569 10 14C10 12.3431 13 9 13 9C13 9 16 12.3431 16 14Z" fill="#C084FC" />
          </svg>
        </div>
      );
    case "Electrician":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#FEF08A", border: "1px solid rgba(234,179,8,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#EAB308" />
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#CA8A04" fillOpacity="0.3" />
            <circle cx="17" cy="6" r="2" fill="#CA8A04" />
            <circle cx="7" cy="18" r="1.5" fill="#EAB308" />
          </svg>
        </div>
      );
    case "Delivery":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#DBEAFE", border: "1px solid rgba(59,130,246,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V8L12 3L3 8V16L12 21L21 16Z" fill="#3B82F6" fillOpacity="0.3" />
            <path d="M12 21V12M12 12L21 8M12 12L3 8" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.5 5.5L16.5 10.5" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      );
    case "Construction":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#FCE7F3", border: "1px solid rgba(236,72,153,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 18H22" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M19 18V13C19 9.13401 15.866 6 12 6C8.13401 6 5 9.13401 5 13V18" fill="#F472B6" />
            <path d="M12 6V3M12 3H9M12 3H15" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    case "Technician":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#E0E7FF", border: "1px solid rgba(99,102,241,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3C15.6 5.4 17.1 5.4 18 6.3L20.7 9C21.6 9.9 21.6 11.4 20.7 12.3C19.8 13.2 18.3 13.2 17.4 12.3L14.7 9.6C13.8 8.7 13.8 7.2 14.7 6.3Z" fill="#818CF8" />
            <path d="M15 9L4 20C3.5 20.5 3 21 2 22C3 21 3.5 20.5 4 20L15 9" stroke="#6366F1" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="17.5" cy="9.5" r="1.5" fill="#E0E7FF" />
          </svg>
        </div>
      );
    case "Office Assistant":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#F1F5F9", border: "1px solid rgba(100,116,139,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="5" width="18" height="12" rx="2" fill="#94A3B8" />
            <path d="M2 20H22" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 17L15 20H9L8 17" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="5" y="7" width="14" height="8" rx="0.5" fill="#F1F5F9" />
          </svg>
        </div>
      );
    case "Sales":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#FEE2E2", border: "1px solid rgba(239,68,68,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="4" y="8" width="16" height="12" rx="2" fill="#FCA5A5" />
            <path d="M9 13C9 14.6569 10.3431 16 12 16C13.6569 16 15 14.6569 15 13" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "Hospitality":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#FFE4E6", border: "1px solid rgba(244,63,94,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 18V9.5C4 7.01472 6.01472 5 8.5 5C10.9853 5 13 7.01472 13 9.5V18" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M20 18V13.5C20 11.0147 17.9853 9 15.5 9C13.0147 9 11 11.0147 11 13.5V18" fill="#FDA4AF" />
            <path d="M2 18H22" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="9" cy="11" r="1.5" fill="#BE123C" />
          </svg>
        </div>
      );
    case "Driving":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#CCFBF1", border: "1px solid rgba(20,184,166,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16L5 10C5.3 8.3 6.8 7 8.5 7H15.5C17.2 7 18.7 8.3 19 10L20 16" fill="#5EEAD4" />
            <rect x="2" y="16" width="20" height="4" rx="2" fill="#14B8A6" />
            <circle cx="6" cy="18" r="1" fill="#FFF" />
            <circle cx="18" cy="18" r="1" fill="#FFF" />
            <path d="M7 10L9 7H15L17 10" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "Warehouse":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#CFFAFE", border: "1px solid rgba(6,182,212,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="6" width="7" height="7" rx="1" fill="#67E8F9" />
            <rect x="13" y="6" width="7" height="7" rx="1" fill="#67E8F9" />
            <rect x="8.5" y="14" width="7" height="7" rx="1" fill="#06B6D4" />
            <path d="M4 22H20" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "Security":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#E2E8F0", border: "1px solid rgba(71,85,105,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L4 7V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V7L12 3Z" fill="#94A3B8" />
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#475569" />
            <path d="M12 23C7.4 21.6 4 16.5 4 11V7L12 3L12 23Z" fill="#475569" fillOpacity="0.4" />
          </svg>
        </div>
      );
    case "Gardening":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#D1FAE5", border: "1px solid rgba(5,150,105,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21V9" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 15C12 15 8 13 8 9C8 5 12 5 12 5C12 5 16 5 16 9C16 13 12 15 12 15Z" fill="#34D399" />
            <path d="M12 21C12 21 16 19 16 16C16 13 12 13 12 13" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    case "Cooking":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#FFEDD5", border: "1px solid rgba(234,88,12,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 13H18C18.6 13 19 13.4 19 14V16C19 18.2 17.2 20 15 20H9C6.8 20 5 18.2 5 16V14C5 13.4 5.4 13 6 13Z" fill="#FDBA74" />
            <path d="M4 13H20" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 10C9 8 10.5 7 12 7C13.5 7 15 8 15 10" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
            <path d="M10 6C10 5 11 4 12 4C13 4 14 5 14 6" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "Tailoring":
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#EDE9FE", border: "1px solid rgba(139,92,246,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21L12 7" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 3C11 3 10 4 10 5C10 6 11 7 12 7C13 7 14 6 14 5C14 4 13 3 12 3Z" fill="#8B5CF6" />
            <path d="M6 12C9 12 11 15 14 17C16 18.3 18 19 20 19" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
          </svg>
        </div>
      );
    case "Other":
    default:
      return (
        <div className="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: "#F3F4F6", border: "1px solid rgba(156,163,175,0.15)" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="12" r="2.5" fill="#9CA3AF" />
            <circle cx="17" cy="12" r="2.5" fill="#9CA3AF" />
            <path d="M9 12H15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
          </svg>
        </div>
      );
  }
};
