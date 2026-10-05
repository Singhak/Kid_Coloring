import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-16 h-16 border-4 border-[#FFD93D] border-t-[#FF6B6B] rounded-full animate-spin" />
      <p className="font-bold text-[#A0A0A0] animate-pulse">Magic is happening...</p>
    </motion.div>
  );
};

export default LoadingSpinner;