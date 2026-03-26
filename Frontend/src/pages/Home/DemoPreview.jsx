import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, BrainCircuit, Sparkles } from 'lucide-react';
import { SectionWrapper, smoothEase } from '../../components/ui/SectionWrapper';
import { PremiumCard } from '../../components/ui/PremiumCard';

export const DemoPreview = () => {
  return (
    <SectionWrapper id="demo" className="bg-zinc-50 border-b border-zinc-100">
      <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
        
        {/* Text Content */}
        <div className="w-full lg:w-5/12 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-4 md:mb-6 leading-tight">Look under the hood of ATS filters.</h2>
          <p className="text-zinc-500 text-lg mb-8 md:mb-10 leading-relaxed font-medium">
            We simulate the parsing algorithms used by Workday, Greenhouse, and Lever. See precisely how machines read your resume before human eyes ever do.
          </p>
          
          <div className="space-y-4 md:space-y-6 mb-12 flex flex-col items-center md:items-start">
            {[
              { title: 'Keyword Optimization', desc: 'Identify missing mandatory skills.' },
              { title: 'Format Verification', desc: 'Ensure data parses correctly.' },
              { title: 'Impact Scoring', desc: 'Measure the strength of your verbs.' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 text-left">
                <div className="mt-1 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h4 className="text-zinc-950 font-bold text-sm md:text-base">{item.title}</h4>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ultra-Premium Glass Mock UI */}
        <div className="w-full lg:w-7/12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] md:w-[120%] h-[100%] md:h-[120%] bg-gradient-to-tr from-violet-200/40 via-blue-100/40 to-indigo-200/40 blur-[60px] md:blur-[100px] -z-10 rounded-full pointer-events-none transform-gpu" />
          
          <PremiumCard hover={false} className="p-1 md:p-2 bg-white/50 backdrop-blur-2xl border-zinc-200/80 ring-1 ring-zinc-200/50">
            {/* Browser/Window Chrome */}
            <div className="bg-white rounded-3xl md:rounded-[1.8rem] border border-zinc-200/60 shadow-sm overflow-hidden">
              
              <div className="bg-zinc-50 px-4 md:px-6 py-3 md:py-4 border-b border-zinc-200/60 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-300" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-zinc-300" />
                </div>
                <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">Analysis Report</div>
                <div className="w-8 md:w-10"></div> {/* Spacer for balance */}
              </div>

              <div className="p-6 md:p-10">
                <div className="flex flex-col sm:flex-row gap-8 md:gap-12 items-center mb-8 md:mb-10">
                  {/* Score Ring */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f4f4f5" strokeWidth="6" />
                      <motion.circle
                        initial={{ strokeDashoffset: 283 }}
                        whileInView={{ strokeDashoffset: 283 - (283 * 0.88) }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, ease: smoothEase }}
                        cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray="283"
                        className="transform-gpu"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center mt-1">
                      <span className="text-4xl md:text-5xl font-black text-zinc-950 tracking-tighter">88<span className="text-xl md:text-2xl text-zinc-400">%</span></span>
                      <span className="text-[10px] md:text-[11px] font-bold text-violet-600 uppercase tracking-widest mt-1 bg-violet-50 px-2 py-0.5 rounded-full">Match</span>
                    </div>
                  </div>

                  {/* Metrics lines */}
                  <div className="flex-1 space-y-4 md:space-y-6 w-full">
                    {[
                      { label: 'Hard Skills', value: '12/14 Found', pct: '85%', color: 'bg-violet-500' },
                      { label: 'Formatting', value: 'Perfect', pct: '100%', color: 'bg-emerald-500' },
                      { label: 'Impact Metrics', value: 'Needs Work', pct: '40%', color: 'bg-rose-500' }
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs md:text-sm mb-1.5 md:mb-2 font-bold">
                          <span className="text-zinc-700">{stat.label}</span>
                          <span className="text-zinc-500">{stat.value}</span>
                        </div>
                        <div className="h-1.5 md:h-2 bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            whileInView={{ width: stat.pct }} 
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: i * 0.2, ease: smoothEase }} 
                            className={`h-full rounded-full transform-gpu ${stat.color}`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insight Box */}
                <div className="bg-zinc-950 rounded-[1.2rem] md:rounded-2xl p-5 md:p-6 relative overflow-hidden text-white shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-16 h-16" />
                  </div>
                  <div className="flex items-start gap-3 md:gap-4 relative z-10">
                    <div className="p-2 bg-white/10 rounded-xl shrink-0 backdrop-blur-md">
                      <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-violet-300" />
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2">Curixo AI Suggestion</h4>
                      <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-medium">
                        Missing the keyword <span className="text-white font-bold px-1.5 py-0.5 bg-white/10 rounded mx-0.5">"React Native"</span> which appears 3 times in the JD. Consider updating your latest role.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </SectionWrapper>
  );
};
