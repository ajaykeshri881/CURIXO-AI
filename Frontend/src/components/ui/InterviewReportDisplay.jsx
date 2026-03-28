import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, AlertTriangle, MessageSquare, Briefcase, 
  CalendarDays, Lightbulb, User, CheckCircle2 
} from 'lucide-react';

export default function InterviewReportDisplay({ report }) {
  if (!report) return null;

  // Handle older raw string reports gracefully
  const renderStringReport = (textContent) => {
    return (
      <div className="prose prose-zinc prose-blue max-w-none">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-8 text-blue-950 font-medium leading-relaxed shadow-inner space-y-4">
          {textContent.split(/\n+/).filter(line => line.trim()).map((line, i) => (
            <div key={i} className="space-y-2">
               {line.split(/(?=\b\d+\.\s|\-\s|\*\s)/).filter(seg => seg.trim()).map((segment, j) => {
                  const match = segment.match(/^(\d+\.\s|\-\s|\*\s)(.*)/s);
                  if (match) {
                     return <div key={j} className="flex gap-3">
                       <span className="font-black text-blue-800 shrink-0">{match[1].trim()}</span>
                       <span>{match[2].trim()}</span>
                     </div>;
                  }
                  return <div key={j} className="block">{segment.trim()}</div>;
               })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (typeof report === 'string') {
    return renderStringReport(report);
  }

  // Handle case where report object has a report string property instead of structured data
  if (typeof report.report === 'string') {
    return renderStringReport(report.report);
  }

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
            <Target className="w-6 h-6 text-blue-500" />
            Match Overview
          </h3>
          {report.matchScore !== undefined && (
            <div className="text-left sm:text-right">
              <div className="text-3xl font-black text-blue-600">{report.matchScore}%</div>
              <div className="text-sm text-zinc-500 font-medium">Match Score</div>
            </div>
          )}
        </div>
        
        {report.skillGaps && report.skillGaps.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Identified Skill Gaps
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.skillGaps.map((gap, i) => (
                <span 
                  key={i} 
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    gap.severity === 'high' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : gap.severity === 'medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {gap.skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Technical Questions */}
      {report.technicalQuestions && report.technicalQuestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
            <Briefcase className="w-6 h-6 text-violet-500" />
            Technical Questions
          </h3>
          <div className="grid gap-4">
            {report.technicalQuestions.map((q, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-white space-y-3">
                <div className="font-bold text-zinc-900 flex gap-2">
                  <span className="text-violet-500">Q:</span> {q.question}
                </div>
                <div className="text-sm bg-violet-50/50 p-3 rounded-xl border border-violet-100/50 text-violet-900">
                  <span className="font-semibold flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4" /> Intention
                  </span>
                  {q.intention}
                </div>
                <div className="text-sm bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-zinc-700">
                  <span className="font-semibold flex items-center gap-1 mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Suggested Answer
                  </span>
                  {q.answer}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Behavioral Questions */}
      {report.behavioralQuestions && report.behavioralQuestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
            <User className="w-6 h-6 text-emerald-500" />
            Behavioral Questions
          </h3>
          <div className="grid gap-4">
            {report.behavioralQuestions.map((q, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-white space-y-3">
                <div className="font-bold text-zinc-900 flex gap-2">
                  <span className="text-emerald-500">Q:</span> {q.question}
                </div>
                <div className="text-sm bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 text-emerald-900">
                  <span className="font-semibold flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4" /> Intention
                  </span>
                  {q.intention}
                </div>
                <div className="text-sm bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-zinc-700">
                  <span className="font-semibold flex items-center gap-1 mb-1">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Suggested Answer
                  </span>
                  {q.answer}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Preparation Plan */}
      {report.preparationPlan && report.preparationPlan.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900">
            <CalendarDays className="w-6 h-6 text-blue-500" />
            Preparation Plan
          </h3>
          <div className="relative border-l-2 border-blue-100 ml-3 space-y-6 pb-4 pt-2">
            {report.preparationPlan.map((plan, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-zinc-50" />
                <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-white">
                  <div className="text-sm font-black text-blue-600 mb-1 uppercase tracking-wider">Day {plan.day}</div>
                  <h4 className="font-bold text-zinc-900 mb-3">{plan.focus}</h4>
                  <ul className="space-y-2">
                    {plan.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-zinc-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
