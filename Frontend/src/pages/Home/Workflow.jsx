import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, BarChart3 } from 'lucide-react';
import { SectionWrapper } from '../../components/ui/SectionWrapper';

export const Workflow = () => {
  const steps = [
    { icon: <Upload className="w-6 h-6 text-zinc-950" />, title: "Upload Resume", desc: "Simply upload your current resume in PDF format to get started." },
    { icon: <FileText className="w-6 h-6 text-zinc-950" />, title: "Add Job Details", desc: "Enter the target job title and paste the job description." },
    { icon: <BarChart3 className="w-6 h-6 text-zinc-950" />, title: "Check & Improve", desc: "Get your ATS match score and use AI to optimize your resume instantly." }
  ];

  return (
    <SectionWrapper id="how-it-works" className="bg-white border-y border-zinc-100">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-20 items-center">
        
        <div className="lg:w-1/3 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-zinc-950 mb-4 md:mb-6">Designed for velocity.</h2>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed">
            Stop guessing what recruiters want. Curixo gives you a clear, step-by-step roadmap to perfectly tailor your application for every single role in minutes.
          </p>
        </div>

        <div className="lg:w-2/3 w-full relative">
          {/* Connection Line Base - Only on desktop */}
          <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-zinc-200 z-0 hidden md:block" />
          
          <div className="space-y-10 md:space-y-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 group cursor-default transform-gpu text-center sm:text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.2rem] md:rounded-[1.5rem] bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-sm group-hover:shadow-xl group-hover:border-zinc-300 relative z-10 group-hover:scale-110 md:group-hover:-translate-y-1 transition-all duration-300 transform-gpu">
                    {step.icon}
                  </div>
                  <div className="absolute inset-0 bg-violet-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none transform-gpu hidden sm:block" />
                </div>
                
                <div className="pt-2 sm:pt-4">
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-950 mb-2 tracking-tight group-hover:text-violet-600 transition-colors duration-300">{step.title}</h3>
                  <p className="text-zinc-500 font-medium text-base md:text-lg max-w-sm mx-auto sm:mx-0">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </SectionWrapper>
  );
};
