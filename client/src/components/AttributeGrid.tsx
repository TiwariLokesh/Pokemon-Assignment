import { motion } from 'framer-motion';

interface AttributeItem {
  label: string;
  value: string;
}

interface AttributeGridProps {
  items: AttributeItem[];
}

export const AttributeGrid = ({ items }: AttributeGridProps) => (
  <div className="grid gap-3">
    {items.map((item, index) => (
      <motion.div
        key={item.label}
        className="rounded-2xl border border-white/10 px-4 py-3 bg-white/5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">{item.label}</p>
        <p className="text-lg font-semibold text-white capitalize break-words">{item.value}</p>
      </motion.div>
    ))}
  </div>
);
