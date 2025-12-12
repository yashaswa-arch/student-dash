import React from "react";
import { PulseBeams } from "../ui/pulse-beams";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const beams = [
  {
    path: "M269 220.5H16.5C10.9772 220.5 6.5 224.977 6.5 230.5V398.5",
    gradientConfig: {
      initial: { x1: "0%", x2: "0%", y1: "80%", y2: "100%" },
      animate: { x1: ["0%", "0%", "200%"], x2: ["0%", "0%", "180%"], y1: ["80%", "0%", "0%"], y2: ["100%", "20%", "20%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop" as const, ease: "linear", repeatDelay: 2, delay: Math.random() * 2 }
    },
    connectionPoints: [
      { cx: 6.5, cy: 398.5, r: 6 },
      { cx: 269, cy: 220.5, r: 6 }
    ]
  },
  {
    path: "M568 200H841C846.523 200 851 195.523 851 190V40",
    gradientConfig: {
      initial: { x1: "0%", x2: "0%", y1: "80%", y2: "100%" },
      animate: { x1: ["20%", "100%", "100%"], x2: ["0%", "90%", "90%"], y1: ["80%", "80%", "-20%"], y2: ["100%", "100%", "0%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop" as const, ease: "linear", repeatDelay: 2, delay: Math.random() * 2 }
    },
    connectionPoints: [
      { cx: 851, cy: 34, r: 6.5 },
      { cx: 568, cy: 200, r: 6 }
    ]
  },
  {
    path: "M425.5 274V333C425.5 338.523 421.023 343 415.5 343H152C146.477 343 142 347.477 142 353V426.5",
    gradientConfig: {
      initial: { x1: "0%", x2: "0%", y1: "80%", y2: "100%" },
      animate: { x1: ["20%", "100%", "100%"], x2: ["0%", "90%", "90%"], y1: ["80%", "80%", "-20%"], y2: ["100%", "100%", "0%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop" as const, ease: "linear", repeatDelay: 2, delay: Math.random() * 2 }
    },
    connectionPoints: [
      { cx: 142, cy: 427, r: 6.5 },
      { cx: 425.5, cy: 274, r: 6 }
    ]
  },
  {
    path: "M493 274V333.226C493 338.749 497.477 343.226 503 343.226H760C765.523 343.226 770 347.703 770 353.226V427",
    gradientConfig: {
      initial: { x1: "40%", x2: "50%", y1: "160%", y2: "180%" },
      animate: { x1: "0%", x2: "10%", y1: "-40%", y2: "-20%" },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop" as const, ease: "linear", repeatDelay: 2, delay: Math.random() * 2 }
    },
    connectionPoints: [
      { cx: 770, cy: 427, r: 6.5 },
      { cx: 493, cy: 274, r: 6 }
    ]
  }
];

const gradientColors = { start: "#3B82F6", middle: "#60A5FA", end: "#93C5FD" };

export const PulseBeamsFirstDemo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PulseBeams beams={beams} gradientColors={gradientColors} className="bg-transparent">
      <div className="flex items-center justify-center z-50 relative">
        {/* GET STARTED BUTTON - Centered in PulseBeams with animated lines */}
        <button
          onClick={() => navigate("/signup")}
          aria-label="Get Started"
          className="w-[280px] md:w-[320px] h-[100px] md:h-[120px] relative group cursor-pointer rounded-full inline-flex items-center justify-center z-50"
        >
          {/* Very light sphere/glow around button */}
          <motion.div
            className="absolute inset-0 rounded-full z-0"
            initial={{ opacity: 0.1 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 100%)',
              filter: 'blur(20px)'
            }}
          />
          <motion.span
            initial={{ y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-3xl font-semibold text-white relative z-50 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            style={{
              textShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4)'
            }}
          >
            Get Started
          </motion.span>
        </button>
      </div>
    </PulseBeams>
  );
};

export default PulseBeamsFirstDemo;

