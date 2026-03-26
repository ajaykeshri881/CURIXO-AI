import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export const PremiumCard = ({ children, className = '', hover = true }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 3D Subtle Tilt Physics
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  // Constrain rotation to a small subtle amount (3 degrees max)
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), { stiffness: 400, damping: 30 });

  const handleMouseMove = (e) => {
    // Disable heavy hover logic on touch devices for better performance
    if (window.matchMedia("(hover: none)").matches) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    mouseX.set(x / rect.width);
    mouseY.set(y / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      onMouseMove={hover ? handleMouseMove : undefined}
      onMouseLeave={hover ? handleMouseLeave : undefined}
      style={hover ? { rotateX, rotateY, transformPerspective: 1000 } : {}}
      whileHover={hover ? { y: -6, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:border-white transition-colors overflow-hidden relative group transform-gpu will-change-transform ${className}`}
    >
      {/* Interactive Spotlight Effect */}
      {hover && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 will-change-transform hidden md:block"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.08), transparent 40%)`,
          }}
        />
      )}
      {/* Subtle inner glare effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
      
      {children}
    </motion.div>
  );
};
