import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { atsService } from '../services/ats.service';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Loader2, Target, Wand2, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AtsReportView() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <main className="flex-grow pt-32 md:pt-40 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full relative z-10">
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
                 <p className="text-slate-500 font-medium">Scanned against <span className="font-bold text-slate-700">{data.jobTitle}</span> role</p>
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
                <p className="text-zinc-500 text-base font-medium mt-1 leading-relaxed">
                    Based on deep keyword extraction, structure analysis, and relevance matching against standard Applicant Tracking Systems.
                </p>
                </div>
            </div>
            
            <div className="space-y-6">
                {/* Strengths */}
                <div className="bg-green-50/80 border border-green-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-extrabold text-green-900 mb-3 text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Strengths
                </h4>
                <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap font-medium">{result.strengths}</p>
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
                <div className="bg-amber-50/80 border border-amber-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-extrabold text-amber-900 mb-3 text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div> Weaknesses & Gaps
                </h4>
                <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap font-medium">{result.weaknesses}</p>
                </div>

                {/* Suggestions */}
                <div className="bg-blue-50/80 border border-blue-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-extrabold text-blue-900 mb-3 text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Actionable Suggestions
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap font-medium">{result.suggestions}</p>
                </div>
            </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
