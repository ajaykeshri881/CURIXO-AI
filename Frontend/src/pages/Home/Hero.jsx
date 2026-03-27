import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { smoothEase } from '../../components/ui/SectionWrapper';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Hero = () => {
  const { user } = useAuth();
  return (
    <section className="relative min-h-[100dvh] md:min-h-screen flex flex-col items-center justify-center pt-24 md:pt-24 pb-20 md:pb-20 overflow-hidden bg-white">
      {/* Ultra-Premium Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[-10%] md:left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-violet-400/20 md:bg-violet-400/15 rounded-full blur-[80px] md:blur-[120px] transform-gpu will-change-transform"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-5%] md:bottom-[10%] right-[-10%] md:right-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-400/20 md:bg-blue-400/15 rounded-full blur-[80px] md:blur-[120px] transform-gpu will-change-transform"
        />
        
        {/* Premium Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] md:bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] md:[mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center relative z-20 flex flex-col items-center">

        {/* Massive Typography - Scaled gracefully for mobile */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: smoothEase }}
          className="text-5xl sm:text-6xl md:text-[80px] lg:text-[100px] font-black tracking-tighter text-zinc-950 mb-6 md:mb-8 leading-[1.05] md:leading-[1.05] transform-gpu"
        >
          The unfair advantage <br className="hidden md:block" />
          for your <span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">career.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: smoothEase }}
          className="text-lg md:text-2xl text-zinc-500 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium tracking-tight transform-gpu"
        >
          Predictive AI that aligns your resume perfectly with enterprise ATS systems. Stop getting filtered out. Start getting interviews.
        </motion.p>

        {/* Elevated Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: smoothEase }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto transform-gpu"
        >
          <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative group w-full transform-gpu"
            >
              <div className="hidden sm:block absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500 will-change-transform"></div>
              <div className="relative w-full px-8 md:px-10 py-4 md:py-5 bg-zinc-950 text-white rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] text-base md:text-lg transition-all">
                {user ? (
                  <>Open Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                ) : (
                  <>Start Building Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </div>
            </motion.button>
          </Link>
          
          <Link to="/ats-check" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 md:px-10 py-4 md:py-5 bg-white border border-zinc-200 text-zinc-800 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-zinc-300 transition-all text-base md:text-lg transform-gpu"
            >
              Check ATS Now
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
