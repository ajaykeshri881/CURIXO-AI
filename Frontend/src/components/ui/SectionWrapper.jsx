import React from 'react';
import { motion } from 'framer-motion';

// --- Premium Custom Easing ---
export const smoothEase = [0.16, 1, 0.3, 1];

export const SectionWrapper = ({ children, className = '', id, noPadding = false }) => (
  <section id={id} className={`relative overflow-hidden ${noPadding ? '' : 'py-20 md:py-32 px-6 md:px-12 lg:px-24'} ${className}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: smoothEase }}
      className="max-w-7xl mx-auto relative z-10 transform-gpu"
    >
      {children}
    </motion.div>
  </section>
);
