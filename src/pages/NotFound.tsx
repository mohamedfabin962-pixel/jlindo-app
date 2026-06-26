import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #F8FAFC 0%, #FFF7ED 55%, #F8FAFC 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Subtle background ambient glows */}
      <div
        className="absolute w-96 h-96 rounded-full filter blur-[100px] opacity-[0.05] -top-10 -left-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full filter blur-[100px] opacity-[0.05] -bottom-10 -right-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #EA580C 0%, transparent 70%)",
        }}
      />

      <div className="flex flex-col items-center max-w-lg z-10">
        
        {/* Floating animated 404 illustration graphic */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-center gap-3.5 mb-6"
        >
          <span className="text-8xl md:text-9xl font-black text-slate-800 tracking-tighter select-none">
            4
          </span>

          {/* Concentric rotating "0" visual */}
          <div className="relative flex items-center justify-center h-24 w-24 md:h-28 md:w-28">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2.5 rounded-full border border-dashed border-orange-500/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-5 rounded-full bg-amber-500/5 blur-sm" />
            <motion.div
              className="relative w-14 h-14 md:w-16 md:h-16 rounded-[20px] bg-white border border-amber-100 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Compass className="h-7 w-7 md:h-8 md:w-8 text-amber-600 animate-pulse" strokeWidth={1.8} />
            </motion.div>
          </div>

          <span className="text-8xl md:text-9xl font-black text-slate-800 tracking-tighter select-none">
            4
          </span>
        </motion.div>

        {/* Messaging */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <h2 className="m-0 text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug max-w-md">
            Oops! The page you're looking for doesn't exist.
          </h2>
          <p className="mt-3.5 mb-0 text-sm md:text-base text-slate-500 max-w-sm leading-relaxed">
            It looks like you've taken a wrong turn or the link has expired. Don't worry, we'll help you get back on track.
          </p>
        </motion.div>

        {/* Navigation Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-row items-center gap-3.5 mt-8 w-full sm:w-auto"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-initial">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-11 px-5 w-full sm:w-auto rounded-xl font-bold border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-initial">
            <Button
              onClick={() => navigate("/")}
              className="h-11 px-5 w-full sm:w-auto rounded-xl font-bold border-0 flex items-center justify-center gap-2 text-white shadow-md hover:shadow-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                boxShadow: "0 4px 18px rgba(245, 158, 11, 0.25)",
              }}
            >
              <Home size={16} />
              <span>Return Home</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;

