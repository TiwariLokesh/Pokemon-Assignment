import { motion } from 'framer-motion';

interface StatMeterProps {
  label: string;
  value: number;
}

export const StatMeter = ({ label, value }: StatMeterProps) => {
  const clamped = Math.min(180, value);
  const percentage = (clamped / 180) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/50 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
