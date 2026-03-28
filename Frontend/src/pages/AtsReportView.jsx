import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { atsService } from '../services/ats.service';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Loader2, Target, Wand2, Download, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AtsReportView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMoreContent, setViewMoreContent] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await atsService.getReportById(id);
      setData(res.report);
    } catch (error) {
      toast.error('Failed to load ATS scan report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex flex-col items-center justify-center">
        <Navbar />
        <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
        <p className="text-zinc-500 font-bold">Loading your ATS deep scan...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] flex flex-col items-center justify-center">
        <Navbar />
        <h2 className="text-2xl font-black text-zinc-900 mb-2">Report Not Found</h2>
        <Link to="/dashboard" className="text-violet-600 font-bold hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const result = data.report;

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 md:pt-36 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full relative z-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 mb-8 transition-colors group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/80 mb-8">
            <div className="flex items-center gap-4 mb-2">
               <div className="w-12 h-12 rounded-[16px] bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100/50 shadow-inner">
                  <Target className="w-6 h-6 text-violet-600" />
               </div>
               <div>
                 <h1 className="text-2xl sm:text-3xl font-black text-slate-900">ATS Scan Result</h1>
                 <p className="text-slate-600 font-medium mt-1">Scanned against <span className="font-bold text-slate-800">{data.jobTitle}</span> role</p>
               </div>
            </div>
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f4f4f5" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke={result.score >= 80 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444'} strokeWidth="8"
                    strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (283 * ((result.score || 0)/100))}
                    className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-black text-zinc-950">{result.score || 0}</span>
                </div>
                </div>
                <div className="text-center sm:text-left">
                <h3 className="text-2xl font-black text-zinc-900">Overall Match Score</h3>
                <p className="text-zinc-600 text-base font-medium mt-1.5 leading-relaxed">
                    Based on deep keyword extraction, structure analysis, and relevance matching against standard Applicant Tracking Systems.
                </p>
                </div>
            </div>
            
            <div className="space-y-6">
                {/* Strengths */}
                <div 
                   className="bg-green-50/80 border border-green-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                   onClick={() => setViewMoreContent({ title: 'Strengths', content: result.strengths, color: 'green' })}
                >
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-extrabold text-green-900 text-lg flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div> Strengths
                     </h4>
                     <span className="text-xs font-bold text-green-700 uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-green-100 px-3 py-1 rounded-full">View Full</span>
                  </div>
                  <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap font-medium line-clamp-4">{result.strengths}</p>
                </div>
                
                {/* Missing Keywords */}
                {result.missingKeywords?.length > 0 && (
                <div className="bg-red-50/80 border border-red-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-extrabold text-red-900 mb-4 text-lg flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-500"></div> Critical Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-4 py-1.5 bg-white text-red-700 text-xs font-extrabold rounded-xl border border-red-200 shadow-sm">
                        {kw}
                        </span>
                    ))}
                    </div>
                </div>
                )}

                {/* Weaknesses */}
                <div 
                   className="bg-amber-50/80 border border-amber-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                   onClick={() => setViewMoreContent({ title: 'Weaknesses & Gaps', content: result.weaknesses, color: 'amber' })}
                >
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-extrabold text-amber-900 text-lg flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-amber-500"></div> Weaknesses & Gaps
                     </h4>
                     <span className="text-xs font-bold text-amber-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 px-3 py-1 rounded-full">View Full</span>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap font-medium line-clamp-4">{result.weaknesses}</p>
                </div>

                {/* Suggestions */}
                <div 
                   className="bg-blue-50/80 border border-blue-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                   onClick={() => setViewMoreContent({ title: 'Actionable Suggestions', content: result.suggestions, color: 'blue' })}
                >
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="font-extrabold text-blue-900 text-lg flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div> Actionable Suggestions
                     </h4>
                     <span className="text-xs font-bold text-blue-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 px-3 py-1 rounded-full">View Full</span>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap font-medium line-clamp-4">{result.suggestions}</p>
                </div>
            </div>
        </motion.div>
      </main>

      {/* View More Modal */}
      <AnimatePresence>
        {viewMoreContent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setViewMoreContent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`relative z-10 bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl border-2 ${
                 viewMoreContent.color === 'amber' ? 'border-amber-100' : 
                 viewMoreContent.color === 'blue' ? 'border-blue-100' : 
                 'border-green-100'
               }`}
            >
              <h3 className={`text-2xl font-black mb-6 ${
                 viewMoreContent.color === 'amber' ? 'text-amber-900' : 
                 viewMoreContent.color === 'blue' ? 'text-blue-900' : 
                 'text-green-900'
               }`}>
                {viewMoreContent.title}
              </h3>
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className={`text-base leading-relaxed font-medium space-y-4 ${
                   viewMoreContent.color === 'amber' ? 'text-amber-900' : 
                   viewMoreContent.color === 'blue' ? 'text-blue-900' : 
                   'text-green-900'
                 }`}>
                  {viewMoreContent.content?.split(/\n+/).filter(line => line.trim()).map((line, i) => (
                    <div key={i} className="space-y-2">
                       {line.split(/(?=\b\d+\.\s|\-\s|\*\s)/).filter(seg => seg.trim()).map((segment, j) => {
                          const match = segment.match(/^(\d+\.\s|\-\s|\*\s)(.*)/s);
                          if (match) {
                             return <div key={j} className="flex gap-2">
                               <span className="font-bold opacity-80 shrink-0">{match[1].trim()}</span>
                               <span>{match[2].trim()}</span>
                             </div>;
                          }
                          return <div key={j} className="block">{segment.trim()}</div>;
                       })}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setViewMoreContent(null)}
                className="w-full mt-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
