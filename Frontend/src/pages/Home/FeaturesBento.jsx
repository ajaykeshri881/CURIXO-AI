import React from 'react';
import { Target, Sparkles, FileText, BrainCircuit, Zap } from 'lucide-react';
import { SectionWrapper } from '../../components/ui/SectionWrapper';
import { PremiumCard } from '../../components/ui/PremiumCard';

export const FeaturesBento = () => {
  return (
    <SectionWrapper id="features" className="bg-zinc-50 border-t border-zinc-100">
      <div className="mb-12 md:mb-20 text-center md:text-left">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-zinc-950 mb-4 md:mb-6">A completely re-engineered <br className="hidden md:block"/> toolkit for job seekers.</h2>
        <p className="text-zinc-500 max-w-2xl mx-auto md:mx-0 text-lg md:text-xl font-medium tracking-tight">Everything you need to bypass filters and impress humans, packaged into a single, beautiful workspace.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[320px]">
        
        {/* Large Feature 1 */}
        <PremiumCard className="md:col-span-2 p-8 md:p-10 flex flex-col justify-between bg-white md:bg-zinc-50/50">
          <div className="flex justify-between items-start mb-8 md:mb-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-500 relative z-10 transform-gpu">
              <Target className="w-6 h-6 md:w-7 md:h-7 text-violet-600" />
            </div>
            <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full tracking-wide relative z-10">Core Feature</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold text-zinc-950 mb-2 md:mb-3 tracking-tight">Enterprise ATS Scoring</h3>
            <p className="text-zinc-500 font-medium leading-relaxed max-w-md text-sm md:text-base">
              We reverse-engineered the top applicant tracking systems. Instantly see your match percentage against any job description and know exactly what keywords you're missing.
            </p>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-20 -bottom-20 w-64 md:w-80 h-64 md:h-80 bg-gradient-to-br from-violet-200/50 to-transparent rounded-full blur-[80px] pointer-events-none transform-gpu" />
        </PremiumCard>

        {/* Small Feature 1 */}
        <PremiumCard className="p-8 md:p-10 flex flex-col justify-between bg-zinc-950 text-white border-zinc-800">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-zinc-800 transition-all duration-500 relative z-10 transform-gpu mb-8 md:mb-0">
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 tracking-tight">AI Enhancement</h3>
            <p className="text-zinc-400 font-medium leading-relaxed text-sm md:text-base">
              Rewrite weak bullet points into high-impact, metrics-driven achievements with one click.
            </p>
          </div>
        </PremiumCard>

        {/* Small Feature 2 */}
        <PremiumCard className="p-8 md:p-10 flex flex-col justify-between bg-white md:bg-zinc-50/50">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-500 relative z-10 transform-gpu mb-8 md:mb-0">
            <FileText className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-bold text-zinc-950 mb-2 md:mb-3 tracking-tight">Dynamic Builder</h3>
            <p className="text-zinc-500 font-medium leading-relaxed text-sm md:text-base">
              Beautiful, recruiter-approved templates that format perfectly every single time.
            </p>
          </div>
        </PremiumCard>

        {/* Medium Feature */}
        <PremiumCard className="md:col-span-2 p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 bg-white md:bg-zinc-50/50 overflow-hidden relative">
          <div className="flex-1 z-10">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1rem] md:rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm mb-6 md:mb-8 group-hover:scale-110 group-hover:shadow-md transition-all duration-500 relative z-10 transform-gpu">
              <BrainCircuit className="w-6 h-6 md:w-7 md:h-7 text-zinc-900" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-zinc-950 mb-2 md:mb-3 tracking-tight">Interview Preparation</h3>
            <p className="text-zinc-500 font-medium leading-relaxed text-sm md:text-base">
              Practice tailored interview questions generated from the job description and your resume. Get real-time feedback on your answers.
            </p>
          </div>
          {/* Mock UI Element inside card */}
          <div className="flex-1 w-full relative h-[160px] md:h-[200px] z-10 hidden sm:block pointer-events-none">
            <div className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 w-full max-w-[280px] md:max-w-[300px] bg-white border border-zinc-200 rounded-2xl shadow-xl p-4 md:p-5 transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500 will-change-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-500"/></div>
                <div className="h-2 w-24 bg-zinc-200 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-zinc-100 rounded-full" />
                <div className="h-2 w-4/5 bg-zinc-100 rounded-full" />
                <div className="h-2 w-3/4 bg-zinc-100 rounded-full" />
              </div>
            </div>
          </div>
        </PremiumCard>

      </div>
    </SectionWrapper>
  );
};
