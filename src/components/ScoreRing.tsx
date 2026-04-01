"use client";

import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
}

export default function ScoreRing({ score }: ScoreRingProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score > 70) return "#00E5FF"; // Cyan
    if (score >= 40) return "#FFD700"; // Amber
    return "#FF4D4D"; // Red
  };

  const getLabel = () => {
    if (score > 70) return "Trustworthy";
    if (score >= 40) return "Suspicious";
    return "Highly Suspicious";
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <svg className="h-48 w-48 -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke="#1A1D23"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke={getColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-syne text-5xl font-bold text-white"
          >
            {score}
          </motion.span>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
            Score
          </span>
        </div>
      </div>
      <div className="text-center">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-bold font-syne"
          style={{ color: getColor() }}
        >
          {getLabel()}
        </motion.p>
        <p className="text-sm text-muted-foreground">Credibility Score</p>
      </div>
    </div>
  );
}
