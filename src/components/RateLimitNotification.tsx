import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';

interface RateLimitNotificationProps {
  isRateLimited: boolean;
}

const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({ isRateLimited }) => {
  return (
    <AnimatePresence>
      {isRateLimited && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-amber-100 border-2 border-amber-400 px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          <Zap className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">Fast Mode: Using Local Magic! (Limit Reached)</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RateLimitNotification;