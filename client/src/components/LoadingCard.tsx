import { motion } from 'framer-motion';

export const LoadingCard = () => (
  <motion.div
    className="w-full max-w-4xl border border-white/10 rounded-3xl p-8 bg-white/5"
    initial={{ opacity: 0.4 }}
    animate={{ opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 1.6, repeat: Infinity }}
  >
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-1/3 bg-white/10 rounded-full" />
      <div className="h-10 w-2/3 bg-white/10 rounded-full" />
      <div className="h-72 w-full bg-white/10 rounded-3xl" />
      <div className="h-4 w-full bg-white/10 rounded-full" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-16 bg-white/10 rounded-2xl" />
        ))}
      </div>
    </div>
  </motion.div>
);
