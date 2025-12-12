import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface Beam {
  path: string;
  gradientConfig: {
    initial: { x1: string; x2: string; y1: string; y2: string };
    animate: { x1: string[] | string; x2: string[] | string; y1: string[] | string; y2: string[] | string };
    transition: {
      duration: number;
      repeat: number;
      repeatType: "loop" | "reverse" | "mirror";
      ease: string;
      repeatDelay?: number;
      delay?: number;
    };
  };
  connectionPoints: Array<{ cx: number; cy: number; r: number }>;
}

interface PulseBeamsProps {
  beams: Beam[];
  gradientColors: {
    start: string;
    middle: string;
    end: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export const PulseBeams: React.FC<PulseBeamsProps> = ({
  beams,
  gradientColors,
  className = "",
  children,
}) => {
  const gradientIds = useMemo(() => 
    beams.map((_, i) => `gradient-${Math.random().toString(36).substr(2, 9)}-${i}`),
    [beams.length]
  );

  return (
    <div className={`relative w-full h-full ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full mix-blend-screen"
        viewBox="0 0 857 427"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' }}
      >
        <defs>
          {/* Glow filter for realistic effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {beams.map((beam, index) => {
            const gradientId = gradientIds[index];
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientColors.start} stopOpacity="0.2" />
                <stop offset="30%" stopColor={gradientColors.start} stopOpacity="0.4" />
                <stop offset="50%" stopColor={gradientColors.middle} stopOpacity="0.9" />
                <stop offset="70%" stopColor={gradientColors.end} stopOpacity="0.4" />
                <stop offset="100%" stopColor={gradientColors.end} stopOpacity="0.2" />
              </linearGradient>
            );
          })}
        </defs>
        {beams.map((beam, index) => {
          const gradientId = gradientIds[index];
          return (
            <g key={index}>
              {/* Base path - always visible but subtle */}
              <path
                d={beam.path}
                stroke={gradientColors.middle}
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                opacity="0.2"
              />
              {/* Animated moving line */}
              <motion.path
                d={beam.path}
                stroke={`url(#${gradientId})`}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                strokeDasharray="20 200"
                initial={{ strokeDashoffset: 0 }}
                animate={{ 
                  strokeDashoffset: [0, -220],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear",
                  delay: (beam.gradientConfig.transition.delay || 0) * 0.8
                }}
              />
              {/* Connection points with pulsing effect */}
              {beam.connectionPoints.map((point, pointIndex) => (
                <g key={pointIndex}>
                  {/* Outer glow */}
                  <motion.circle
                    cx={point.cx}
                    cy={point.cy}
                    r={point.r * 2}
                    fill={gradientColors.middle}
                    filter="url(#glow)"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.3, 0],
                      scale: [0.8, 1.5, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      delay: (beam.gradientConfig.transition.delay || 0) + pointIndex * 0.3
                    }}
                  />
                  {/* Inner core */}
                  <motion.circle
                    cx={point.cx}
                    cy={point.cy}
                    r={point.r}
                    fill={gradientColors.middle}
                    filter="url(#glow)"
                    initial={{ opacity: 0.5 }}
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      delay: (beam.gradientConfig.transition.delay || 0) + pointIndex * 0.3
                    }}
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {children && (
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {children}
        </div>
      )}
    </div>
  );
};

