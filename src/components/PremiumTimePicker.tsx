import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HOURS, MINUTES, PERIODS, type Period, type TimeValue } from "@/utils/locationUtils";

interface PremiumTimePickerProps {
  label: string;
  value: TimeValue;
  onChange: (v: TimeValue) => void;
  required?: boolean;
}

// ─── Time Picker Selection Controls ──────────────────────────────────────────

function TimePickerContent({
  draftVal,
  setDraftVal,
  onConfirm,
  onCancel,
}: {
  draftVal: TimeValue;
  setDraftVal: React.Dispatch<React.SetStateAction<TimeValue>>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4 text-left select-none">
      {/* Draft Time Preview */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Time</span>
        <span className="text-sm font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl tabular-nums">
          {draftVal.hour.padStart(2, "0")}:{draftVal.minute} {draftVal.period}
        </span>
      </div>

      {/* Hour Grid (4x3) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Hour</span>
        <div className="grid grid-cols-4 gap-1.5">
          {HOURS.map((h) => {
            const isSelected = draftVal.hour === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setDraftVal((prev) => ({ ...prev, hour: h }))}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                {h.padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minute Selector (1x4) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Minute</span>
        <div className="grid grid-cols-4 gap-1.5">
          {MINUTES.map((m) => {
            const isSelected = draftVal.minute === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setDraftVal((prev) => ({ ...prev, minute: m }))}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* AM/PM Selector (1x2) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">AM/PM</span>
        <div className="grid grid-cols-2 gap-2">
          {PERIODS.map((p) => {
            const isSelected = draftVal.period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setDraftVal((prev) => ({ ...prev, period: p as Period }))}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="py-2 rounded-xl text-xs font-black text-white hover:opacity-95 transition-opacity cursor-pointer"
          style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

// ─── Desktop Popover Component ───────────────────────────────────────────────

function DesktopPopover({
  draftVal,
  setDraftVal,
  triggerRect,
  onConfirm,
  onCancel,
  popoverRef,
}: {
  draftVal: TimeValue;
  setDraftVal: React.Dispatch<React.SetStateAction<TimeValue>>;
  triggerRect: DOMRect;
  onConfirm: () => void;
  onCancel: () => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}) {
  const POPOVER_HEIGHT = 330;
  const POPOVER_WIDTH = 290;

  const spaceBelow = window.innerHeight - triggerRect.bottom - 8;
  const spaceAbove = triggerRect.top - 8;
  const openUpward = spaceBelow < POPOVER_HEIGHT && spaceAbove > spaceBelow;

  let top = openUpward
    ? triggerRect.top - POPOVER_HEIGHT - 8
    : triggerRect.bottom + 8;

  // Clamp within viewport
  top = Math.max(8, Math.min(top, window.innerHeight - POPOVER_HEIGHT - 8));

  // Align with trigger
  let left = triggerRect.left;
  if (left + POPOVER_WIDTH > window.innerWidth - 8) {
    left = triggerRect.right - POPOVER_WIDTH;
  }
  left = Math.max(8, Math.min(left, window.innerWidth - POPOVER_WIDTH - 8));

  console.log("DesktopPopover coords:", {
    top,
    left,
    triggerRect: {
      left: triggerRect.left,
      right: triggerRect.right,
      top: triggerRect.top,
      bottom: triggerRect.bottom,
      width: triggerRect.width,
      height: triggerRect.height
    },
    openUpward,
    window: { w: window.innerWidth, h: window.innerHeight }
  });

  return createPortal(
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: openUpward ? 6 : -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: openUpward ? 4 : -4, scale: 0.97 }}
      transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "fixed",
        top,
        left,
        width: POPOVER_WIDTH,
        zIndex: 99999,
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-[0_16px_48px_rgba(0,0,0,0.12)] p-4 overflow-hidden"
    >
      <TimePickerContent
        draftVal={draftVal}
        setDraftVal={setDraftVal}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </motion.div>,
    document.body
  );
}

// ─── Mobile Modal Dialog Component ──────────────────────────────────────────

function MobileModal({
  draftVal,
  setDraftVal,
  onConfirm,
  onCancel,
  popoverRef,
}: {
  draftVal: TimeValue;
  setDraftVal: React.Dispatch<React.SetStateAction<TimeValue>>;
  onConfirm: () => void;
  onCancel: () => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}) {
  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999 }}
      className="flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => {
        // If clicking on the backdrop itself, close the modal
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-2xl p-5 overflow-y-auto max-h-[90vh]"
      >
        <TimePickerContent
          draftVal={draftVal}
          setDraftVal={setDraftVal}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </motion.div>
    </div>,
    document.body
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PremiumTimePicker({ label, value, onChange, required = true }: PremiumTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [draftVal, setDraftVal] = useState<TimeValue>(value);
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Track mobile breakpoint
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Update positioning relative to trigger (scrolling/resizing)
  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (!open || isMobile) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, { capture: true });
    };
  }, [open, isMobile, updatePosition]);

  // Click outside to close (desktop only, since mobile modal handles click on backdrop)
  useEffect(() => {
    if (!open || isMobile) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, isMobile]);

  const handleOpen = useCallback(() => {
    setDraftVal(value);
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen(true);
  }, [value]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleConfirm = useCallback(() => {
    onChange(draftVal);
    setOpen(false);
  }, [onChange, draftVal]);

  const displayHour = value.hour.padStart(2, "0");
  const displayTime = `${displayHour}:${value.minute} ${value.period}`;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-amber-500">*</span>}
      </label>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? handleClose : handleOpen}
        className={`
          w-full flex items-center justify-between h-11 px-4 rounded-xl border text-sm font-bold
          transition-all duration-200 bg-white group cursor-pointer text-left
          ${open
            ? "border-amber-500 ring-4 ring-amber-500/10 shadow-sm bg-amber-50/20"
            : "border-slate-200 hover:border-amber-400 hover:shadow-sm"
          }
        `}
      >
        <span className="flex items-center gap-2.5 pointer-events-none">
          <span className={`p-1.5 rounded-lg transition-colors duration-200 ${open ? "bg-amber-100" : "bg-slate-100 group-hover:bg-amber-50"}`}>
            <Clock className={`w-3.5 h-3.5 transition-colors duration-200 ${open ? "text-amber-600" : "text-slate-400 group-hover:text-amber-500"}`} />
          </span>
          <span className={`transition-colors duration-200 tabular-nums tracking-wide ${open ? "text-amber-700" : "text-slate-700"}`}>
            {displayTime}
          </span>
        </span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors duration-200 pointer-events-none
          ${open ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500"}`}
      >
        {open ? "Close" : "Edit"}
      </span>
      </button>

      {/* Overlays */}
      <AnimatePresence>
        {open && (
          isMobile ? (
            <MobileModal
              key="mobile-modal"
              draftVal={draftVal}
              setDraftVal={setDraftVal}
              onConfirm={handleConfirm}
              onCancel={handleClose}
              popoverRef={popoverRef}
            />
          ) : triggerRect ? (
            <DesktopPopover
              key="desktop-popover"
              draftVal={draftVal}
              setDraftVal={setDraftVal}
              triggerRect={triggerRect}
              onConfirm={handleConfirm}
              onCancel={handleClose}
              popoverRef={popoverRef}
            />
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}
