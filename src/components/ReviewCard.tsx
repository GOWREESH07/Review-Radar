"use client";

import { Star, CheckCircle2, AlertTriangle } from "lucide-react";
import { Review } from "@/lib/analysisEngine";
import { motion } from "framer-motion";

interface ReviewCardProps {
  review: Review & { reasons?: string[]; riskLevel?: "High" | "Medium" };
  type: "flagged" | "genuine";
}

// Bug 9 Fix: Coloured initials avatar
function getAvatarColor(name: string): string {
  const colors = [
    "#0EA5E9", "#8B5CF6", "#EC4899", "#F59E0B",
    "#10B981", "#EF4444", "#6366F1", "#14B8A6"
  ];
  const index = (name || "").split("").reduce(
    (acc, char) => acc + char.charCodeAt(0), 0
  ) % colors.length;
  return colors[index];
}

function getInitials(name: string): string {
  return (name || "?")
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

export default function ReviewCard({ review, type }: ReviewCardProps) {
  const isFlagged = type === "flagged";
  const isHighRisk = isFlagged && review.riskLevel === "High";

  // Bug 2 Fix: Defensive star rating — force to number
  const rating = Math.round(Number(review.rating) || 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative rounded-xl border-l-4 p-5 glass-panel transition-all hover:translate-x-1 ${
        isHighRisk 
          ? "border-red-600 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.1)]" 
          : isFlagged 
          ? "border-red-500 bg-red-500/5" 
          : "border-cyan-vibrant bg-cyan-vibrant/5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Bug 9 Fix: Coloured initials avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: getAvatarColor(review.author || ""),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {getInitials(review.author || "?")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-syne font-bold text-white leading-tight">{review.author}</h4>
              {isHighRisk && (
                <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-tighter">
                  High Risk
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {/* Bug 2 Fix: Defensive star rendering using pre-cast number */}
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < rating ? "fill-cyan-vibrant text-cyan-vibrant" : "text-dark-border"}`}
                />
              ))}
              {review.verified && (
                <span className="ml-2 flex items-center gap-1 rounded-full bg-cyan-vibrant/10 px-2 py-0.5 text-[10px] font-bold text-cyan-vibrant border border-cyan-vibrant/20 uppercase tracking-tighter">
                  <CheckCircle2 className="h-2 w-2" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {review.date ? new Date(review.date).toLocaleDateString() : ""}
        </span>
      </div>

      <div className="mt-4">
        <h5 className="text-sm font-bold text-white mb-1">{review.title}</h5>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {review.text}
        </p>
      </div>

      {isFlagged && review.reasons && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.reasons.map((reason, i) => (
            <span 
              key={i} 
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold border transition-colors ${
                isHighRisk 
                ? "bg-red-600/20 text-red-400 border-red-600/30" 
                : "bg-red-500/10 text-red-500 border-red-500/20"
              }`}
            >
              <AlertTriangle className="h-3 w-3" /> {reason}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
