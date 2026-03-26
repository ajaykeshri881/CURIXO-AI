import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { smoothEase } from '../../components/ui/SectionWrapper';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const CTASection = () => {
  const { user } = useAuth();
  return (
    <section className="py-24 md:py-32 px-4 md:px-12 relative overflow-hidden bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: smoothEase }}
        className="max-w-5xl mx-auto text-center relative z-10 transform-gpu"
      >
        <motion.div 
          whileHover={{ scale: 1.02, y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative p-8 sm:p-12 md:p-24 bg-zinc-950 text-white rounded-3xl md:rounded-[3rem] border border-zinc-800 shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:hover:shadow-[0_30px_80px_rgba(139,92,246,0.25)] overflow-hidden group cursor-default transform-gpu will-change-transform"
        >
          {/* Subtle architectural noise/grid inside the dark card */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          {/* Animated Violet Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] md:w-[80%] h-40 bg-violet-500/30 blur-[80px] md:blur-[100px] rounded-full group-hover:bg-violet-500/50 transition-colors duration-700 pointer-events-none transform-gpu hidden md:block" />

          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 md:mb-8 leading-[1.1] transform-gpu"
            >
              Stop applying.<br/>Start interviewing.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-zinc-400 mb-10 md:mb-12 max-w-2xl mx-auto font-medium transform-gpu"
            >
              Join the top 1% of applicants. Get full access to our AI suite, completely free.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 transform-gpu"
            >
              <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group/btn w-full px-8 md:px-10 py-4 md:py-5 bg-white text-zinc-950 text-base md:text-lg font-bold rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.3)] transition-shadow flex items-center justify-center gap-3 transform-gpu will-change-transform"
                >
                  {user ? (
                    <>Open Dashboard <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" /></>
                  ) : (
                    <>Create Free Account <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" /></>
                  )}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
