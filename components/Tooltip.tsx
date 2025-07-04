import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'top' }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: side === 'top' ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: side === 'top' ? -8 : 8 }}
            transition={{ duration: 0.18 }}
            className={`absolute z-50 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium shadow-lg pointer-events-none whitespace-nowrap ${
              side === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' :
              side === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' :
              side === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' :
              'left-full top-1/2 -translate-y-1/2 ml-2'
            }`}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip; 