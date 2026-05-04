import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Card = ({ 
  children, 
  className, 
  glass = true, 
  glow = false,
  neon = false, // Deprecated but kept for backward compatibility to avoid breaking existing imports
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-2xl relative overflow-hidden',
        glass && 'glass-card',
        glow && 'inner-glow',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
