import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/cn";
import { formatCompletionPercent, formatCompletionPercentLabel } from "../../lib/format-percent";

type AnimatedProgressProps = {
  value: number;
  className?: string;
  showLabel?: boolean;
};

export function AnimatedProgress({ value, className, showLabel = false }: AnimatedProgressProps) {
  const reduceMotion = useReducedMotion();
  const displayValue = formatCompletionPercent(value);

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/70">
          <span>Progreso</span>
          <span>{formatCompletionPercentLabel(value)}</span>
        </div>
      ) : null}
      <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
          className="relative h-full rounded-full bg-gradient-to-r from-panini-emerald via-emerald-300 to-panini-gold"
        >
          <span className="absolute inset-0 shimmer opacity-60" />
        </motion.div>
      </div>
    </div>
  );
}

type CompletionRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
};

export function CompletionRing({
  value,
  size = 88,
  stroke = 8,
  className
}: CompletionRingProps) {
  const reduceMotion = useReducedMotion();
  const displayValue = formatCompletionPercent(value);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#F6C453" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-xl font-black leading-none">
          {formatCompletionPercentLabel(value)}
        </strong>
      </div>
    </div>
  );
}
