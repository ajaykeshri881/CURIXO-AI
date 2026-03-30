import React, { useState, useEffect, useRef } from 'react';
import { interviewService } from '../../services/interview.service';
import toast from 'react-hot-toast';
import { UploadCloud, Loader2, BrainCircuit, CheckCircle2, FileSearch, Sparkles, ChevronRight, ArrowRight, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InterviewReportDisplay from '../../components/ui/InterviewReportDisplay';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import SEO from '../../components/SEO';

export default function InterviewPrep() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [jobDesc, setJobDesc] = useState('');
  const [selfDesc, setSelfDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  const [loadingMessage, setLoadingMessage] = useState('');

  const loadingMessages = [
    "Reading your resume profile...",
    "Analyzing target job constraints...",
    "Simulating interviewer behaviors...",
    "Formulating technical questions...",
    "Generating behavioral scenarios...",
    "Finalizing interview strategy report..."
  ];

  // Countdown timer — ticks every second while the limit modal is open
  useEffect(() => {
    if (!showLimitPrompt) return;

    const getSecondsUntilMidnightIST = () => {
      const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
      const now = new Date();
      const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
      // Midnight of next IST day expressed as UTC timestamp
      const nextMidnightIST = new Date(
        Date.UTC(
          nowIST.getUTCFullYear(),
          nowIST.getUTCMonth(),
          nowIST.getUTCDate() + 1,
          0, 0, 0, 0
        ) - IST_OFFSET_MS
      );
      return Math.max(0, Math.floor((nextMidnightIST - now) / 1000));
    };

    const format = (secs) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      return [
        String(h).padStart(2, '0'),
        String(m).padStart(2, '0'),
        String(s).padStart(2, '0')
      ].join(':');
    };

    // Set immediately so there's no 1-second blank
    setCountdown(format(getSecondsUntilMidnightIST()));

    const timer = setInterval(() => {
      const secs = getSecondsUntilMidnightIST();
      setCountdown(format(secs));
      if (secs <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [showLimitPrompt]);

  useEffect(() => {
    let interval;
    if (loading) {
      let i = 0;
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobDesc || !selfDesc) {
      toast.error('Please provide resume, job description, and self description.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDesc);
    formData.append('selfDescription', selfDesc);

    setLoading(true);
    try {
      const data = await interviewService.generateInterviewReport(formData);
      setReport(data.interviewReport); // Match backend: { message, interviewReport }
      toast.success('Interview Preparation generated successfully!');
    } catch (error) {
      if (error.response?.status === 429) {
        setShowLimitPrompt(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate interview questions');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col overflow-x-hidden">
      <SEO title="AI Interview Preparation" description="Generate tailored interview questions, strategies, and personalized talking points modeled after your exact background and target role." path="/interview-prep" />
      <Navbar />

      {/* Full Screen Dynamic Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/70 backdrop-blur-md"
          >
            <div className="bg-white px-8 py-10 rounded-[2rem] shadow-2xl border border-blue-100 flex flex-col items-center max-w-sm w-full relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-cyan-50 opacity-50" />
               <div className="relative z-10 flex flex-col items-center">
                 <div className="w-20 h-20 mb-6 relative">
                   <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
                   <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                     <BrainCircuit className="w-8 h-8 animate-pulse" />
                   </div>
                 </div>
                 
                 <h3 className="text-xl font-black text-slate-900 mb-2">
                   Preparing Interview
                 </h3>
                 
                 <div className="h-6 flex items-center justify-center overflow-hidden w-full">
                   <AnimatePresence mode="wait">
                     <motion.p
                       key={loadingMessage}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       transition={{ duration: 0.3 }}
                       className="text-sm font-semibold text-blue-700 text-center"
                     >
                       {loadingMessage}
                     </motion.p>
                   </AnimatePresence>
                 </div>

                 <div className="mt-6 flex items-center justify-center">
                   <span className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-bold text-blue-500 uppercase tracking-widest border border-blue-100/50 shadow-sm">
                     This usually takes 1–2 minutes.
                   </span>
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Grid & Gradients */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Soft Glowing Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className={`relative max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 lg:pt-32 pb-16 flex-grow ${isFullscreen ? 'z-[200]' : 'z-10'}`}>
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-3">
            <BrainCircuit className="hidden md:block text-blue-600 w-10 h-10 translate-y-1" strokeWidth={3} />
            <span>AI</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">Interview Preparation</span>
          </h1>
          <p className="mt-4 text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Generate tailored interview questions, strategies, and personalized talking points modeled after your exact background and target role.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-9 shadow-xl shadow-slate-200/40 border border-white">
             <form onSubmit={handleSubmit} className="flex flex-col gap-6">
               
               <div>
                  <label className="flex items-center gap-3 font-bold text-slate-800 mb-3 text-base">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 text-blue-700 text-sm font-extrabold shadow-sm">1</span>
                    Upload Resume (PDF)
                  </label>
                  <div 
                  className={`
                    relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-out
                    flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden group
                    ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-inner' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300'}
                    ${fileName ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300' : ''}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input type="file" className="hidden" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} />
                  {fileName ? (
                    <div className="flex flex-col items-center text-emerald-600 z-0 text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={24} strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-base text-emerald-700">{fileName}</span>
                      <span className="text-emerald-500 text-xs font-semibold mt-1">Ready to analyze • Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500 z-0 text-center">
                      <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-2 border border-slate-100 group-hover:scale-110 transition-all">
                        <UploadCloud size={24} className="text-blue-500" strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-slate-700 text-base">Click to browse or drag & drop</span>
                      <span className="text-slate-400 text-xs font-semibold mt-1">PDF max 3MB required</span>
                    </div>
                  )}
                 </div>
               </div>

               <div>
                  <label className="flex items-center gap-3 font-bold text-slate-800 mb-3 text-base">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 text-sm font-extrabold shadow-sm">2</span>
                    Target Job Description
                  </label>
                 <textarea
                   className="w-full h-32 bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                   placeholder="Paste the target role description here..."
                   value={jobDesc}
                   onChange={(e) => setJobDesc(e.target.value)}
                 />
               </div>

               <div>
                 <label className="flex items-center gap-3 font-bold text-slate-800 mb-3 text-base">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-extrabold shadow-sm">3</span>
                    Introductory Self Description
                  </label>
                 <textarea
                   className="w-full h-24 bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                   placeholder="Briefly describe your background, strengths, and areas you're worried about..."
                   value={selfDesc}
                   onChange={(e) => setSelfDesc(e.target.value)}
                 />
               </div>

               <button 
                  type="submit"
                  disabled={loading || !fileName}
                  className={`
                    group w-full font-bold text-base rounded-2xl py-3.5 mt-1 flex items-center justify-center gap-3 transition-all duration-300 shadow-xl 
                    ${!fileName 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                      : loading
                        ? 'bg-blue-600 text-white shadow-blue-600/30 cursor-wait'
                        : 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/20 hover:shadow-blue-600/30 active:scale-[0.98]'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 size={22} className="animate-spin text-white/90" />
                      PREPARING QUESTIONS...
                    </>
                  ) : (
                    <>
                      <Sparkles size={22} className={fileName ? "text-blue-300" : "text-white"} />
                      GENERATE PREP PLAN
                      <ChevronRight size={22} className={`transition-transform ${fileName ? 'opacity-70 group-hover:translate-x-1' : 'opacity-40'}`} />
                    </>
                  )}
                </button>
             </form>
            </div>

            <div className={report && isFullscreen ? "fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 md:p-10 animate-in fade-in" : "lg:col-span-5 flex flex-col lg:sticky lg:top-28 w-full pb-8"}>
              <div className={report && isFullscreen ? "bg-white rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-2xl w-full h-full max-w-7xl flex flex-col relative animate-in zoom-in-95 duration-300 border border-blue-100" : "bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 border border-white h-full flex flex-col min-h-[380px] max-h-[90vh] relative overflow-hidden"}>
                 <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-3 shrink-0">
                   Interview Report
                   {report ? (
                     <button
                       onClick={() => setIsFullscreen(!isFullscreen)}
                       className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200 shadow-sm transition-colors"
                     >
                       {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} 
                       {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                     </button>
                   ) : (
                     <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider ml-auto border border-blue-100 shadow-sm">AI Generated</span>
                   )}
                 </h2>

                {!report && !loading && (
                   <div className="flex-1 border-2 border-dashed border-slate-200/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 relative overflow-hidden group hover:border-blue-200 transition-colors">
                     <div className="flex flex-col items-center justify-center">
                       <div className="relative w-20 h-20 flex items-center justify-center mb-5">
                         <div className="absolute inset-0 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                         <div className="absolute inset-6 bg-blue-600 rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-500 delay-150">
                           <BrainCircuit size={24} strokeWidth={2.5} />
                         </div>
                       </div>
                       <h3 className="text-slate-900 font-extrabold text-lg mb-2">Awaiting Parameters</h3>
                       <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-[280px]">
                         Submit your resume and details to generate tailored interview questions and strategies.
                       </p>
                     </div>
                   </div>
                )}
                {loading && (
                   <div className="flex-1 border-2 border-dashed border-slate-200/80 rounded-3xl flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 relative overflow-hidden">
                     <div className="flex flex-col items-center justify-center mt-2">
                       <div className="relative w-20 h-20 mb-4">
                         <div className="absolute inset-0 bg-blue-100 rounded-xl rotate-3 animate-pulse"></div>
                         <div className="absolute inset-0 bg-white rounded-xl -rotate-3 border border-slate-100 shadow-lg flex items-center justify-center overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                            <FileSearch size={32} className="text-blue-400" />
                         </div>
                       </div>
                       <h3 className="text-slate-900 font-extrabold text-lg mb-2 animate-pulse">Processing context...</h3>
                       <p className="text-slate-600 text-xs font-medium leading-relaxed max-w-[220px]">
                         Curixo AI is reading your resume and generating hyper-relevant questions.
                       </p>
                     </div>
                   </div>
                )}
                {report && (
                  <div className={`flex-1 w-full overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-500 bg-white rounded-[2rem] ${isFullscreen ? 'h-full' : 'max-h-[80vh]'}`}>
                    <InterviewReportDisplay report={report} />
                  </div>
                )}
              </div>
            </div>
          </div>
      </main>

      {/* Limit Prompt Modal for Exhausted Quota */}
      <AnimatePresence>
        {showLimitPrompt && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowLimitPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-white"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shadow-inner">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/30">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  Daily Limit Reached
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                  Curixo AI provides high-quality AI processing completely <span className="font-bold text-orange-600">for free</span>. To keep this sustainable for everyone without charging subscriptions, we use a fair-use daily limit.
                </p>
                <div className="mt-5 p-4 bg-orange-50 border border-orange-100 rounded-2xl shadow-inner">
                  <p className="text-orange-700 text-xs font-semibold uppercase tracking-widest mb-2">Your limit resets in</p>
                  <div className="flex items-center justify-center gap-2">
                    {countdown.split(':').map((unit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="bg-white border border-orange-200 rounded-xl px-3 py-2 min-w-[3rem] text-center shadow-sm">
                          <span className="text-2xl font-black text-orange-600 tabular-nums">{unit}</span>
                          <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mt-0.5">
                            {['Hours', 'Mins', 'Secs'][i]}
                          </p>
                        </div>
                        {i < 2 && <span className="text-xl font-black text-orange-300 -mt-3">:</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowLimitPrompt(false)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-xl shadow-slate-900/20 transition-all uppercase tracking-wider"
              >
                Understood, see you tomorrow
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
      <Footer />
    </div>
  );
}
