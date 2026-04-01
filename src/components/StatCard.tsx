"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subValue?: string;
  delay?: number;
  color?: string;
}

export default function StatCard({ label, value, icon: Icon, subValue, delay = 0, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl border border-dark-border bg-dark-surface p-6 transition-all hover:border-cyan-vibrant/50 group"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${color ? color.replace('text-', 'bg-') + '/10 ' + color : 'bg-cyan-vibrant/10 text-cyan-vibrant'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-syne text-2xl font-bold text-white">{value}</h3>
            {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
