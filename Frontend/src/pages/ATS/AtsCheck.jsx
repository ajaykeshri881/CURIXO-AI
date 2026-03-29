import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { atsService } from '../../services/ats.service';
import { resumeService } from '../../services/resume.service';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, Target, Loader2, ArrowRight, FileSearch, CheckCircle2, ChevronRight, Wand2, Download, Sparkles, Lock, LogIn, UserPlus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export default function AtsCheck() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [result, setResult] = useState(null);
  const [improvedResume, setImprovedResume] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [viewMoreContent, setViewMoreContent] = useState(null);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [countdown, setCountdown] = useState('');
  const fileInputRef = useRef(null);

  const [loadingMessage, setLoadingMessage] = useState('');

  const loadingMessages = [
    "Scanning your resume...",
    "Extracting core skills...",
    "Comparing against ATS algorithms...",
    "Identifying keyword gaps...",
    "Generating match score..."
  ];

  const improvingMessages = [
    "Analyzing critical feedback...",
    "Structuring AI improvements...",
    "Formulating high-impact phrasing...",
    "Integrating missing keywords...",
    "Finalizing ATS optimized output..."
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
    } else if (improving) {
      let i = 0;
      setLoadingMessage(improvingMessages[0]);
      interval = setInterval(() => {
        i = (i + 1) % improvingMessages.length;
        setLoadingMessage(improvingMessages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, improving]);

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
    if (!file || !jobTitle || !jobDesc) {
      toast.error('Please provide a resume, job title, and description.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobTitle', jobTitle);
    formData.append('jobDescription', jobDesc);

    setLoading(true);
    setResult(null);
    setImprovedResume(null);
    try {
      const data = await atsService.checkAts(formData);
      setResult(data);
      toast.success('Analysis complete!');
    } catch (error) {
      const status = error.response?.status;
      if (status === 429 && !user) {
        // Guest hit their free limit — show signup/login prompt
        setShowAuthPrompt(true);
      } else if (status === 429) {
        setShowLimitPrompt(true);
      } else {
        toast.error(error.response?.data?.message || 'Error analyzing resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImproveResume = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    if (!result?.resumeText) {
      toast.error("Original resume text missing.");
      return;
    }
    setImproving(true);
    try {
      // Clean up atsFeedback payload so it only contains the feedback
      const { resumeText, isGuest, ...atsFeedback } = result;
      const data = await atsService.improveResume({
        resumeText: result.resumeText,
        jobTitle,
        jobDescription: jobDesc,
        atsFeedback
      });
      setImprovedResume(data.improvedResume);
      toast.success('Resume improved! Redirecting to AI Resume Maker...');
      // Small timeout to let the toast appear smoothly before routing
      setTimeout(() => {
        navigate('/resume-builder', { state: { improvedHtml: data.improvedResume, jobTitle } });
      }, 300);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        setShowAuthPrompt(true);
      } else if (status === 429) {
        setShowLimitPrompt(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to improve resume');
      }
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Full Screen Dynamic Loading Overlay */}
      <AnimatePresence>
        {(loading || improving) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/70 backdrop-blur-md"
          >
            <div className="bg-white px-8 py-10 rounded-[2rem] shadow-2xl border border-violet-100 flex flex-col items-center max-w-sm w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-50 to-indigo-50 opacity-50" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 mb-6 relative">
                  <div className="absolute inset-0 border-4 border-violet-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-violet-600">
                    <Target className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {loading ? "Analyzing Resume" : "AI is Working"}
                </h3>

                <div className="h-6 flex items-center justify-center overflow-hidden w-full">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMessage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-semibold text-violet-700 text-center"
                    >
                      {loadingMessage}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex items-center justify-center">
                  <span className="px-3 py-1 bg-violet-50 rounded-full text-[10px] font-bold text-violet-500 uppercase tracking-widest border border-violet-100/50 shadow-sm">
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
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-400/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 lg:pt-32 pb-16 flex-grow ">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-3">
            <Target className="hidden md:block text-violet-600 w-10 h-10 translate-y-1" strokeWidth={3} />
            <span>ATS</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">Resume Scanner</span>
          </h1>
          <p className="mt-4 text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Upload your resume to reveal your match score and analyze keywords. Adding a job description is optional but recommended for better accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-9 shadow-xl shadow-slate-200/40 border border-white flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Step 1: Upload */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-800 mb-3 text-base">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-violet-100 text-violet-700 text-sm font-extrabold shadow-sm">1</span>
                  Upload Resume (PDF)
                </label>
                <div
                  className={`
                    relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-out
                    flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden group
                    ${isDragging ? 'border-violet-500 bg-violet-50 scale-[1.02] shadow-inner' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-violet-300'}
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
                      <span className="text-emerald-500 text-xs font-semibold mt-1">Ready to scan • Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500 z-0 text-center">
                      <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center mb-2 border border-slate-100 group-hover:scale-110 transition-all">
                        <UploadCloud size={24} className="text-violet-500" strokeWidth={2.5} />
                      </div>
                      <span className="font-extrabold text-slate-700 text-base">Click to browse or drag & drop</span>
                      <span className="text-slate-400 text-xs font-semibold mt-1">PDF max 3MB required</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Job Title */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-800 mb-3 text-base">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-100 text-blue-700 text-sm font-extrabold shadow-sm">2</span>
                  Target Job Title
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                    <FileText size={20} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              {/* Step 3: Job Description */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-800 mb-3 text-base justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-extrabold shadow-sm">3</span>
                    Paste Job Description
                  </div>
                </label>
                <textarea
                  placeholder="Paste the target job description here for a tailored match analysis..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full h-32 bg-slate-50/80 border border-slate-200 text-slate-800 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || !fileName}
                className={`
                  group w-full font-bold text-base rounded-2xl py-3.5 mt-1 flex items-center justify-center gap-3 transition-all duration-300 shadow-xl 
                  ${!fileName
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                    : loading
                      ? 'bg-violet-600 text-white shadow-violet-600/30 cursor-wait'
                      : 'bg-slate-900 hover:bg-violet-600 text-white shadow-slate-900/20 hover:shadow-violet-600/30 active:scale-[0.98]'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin text-white/90" />
                    ANALYZING MATCH...
                  </>
                ) : (
                  <>
                    <Sparkles size={22} className={fileName ? "text-violet-300" : "text-white"} />
                    SCAN RESUME
                    <ChevronRight size={22} className={`transition-transform ${fileName ? 'opacity-70 group-hover:translate-x-1' : 'opacity-40'}`} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 flex flex-col min-h-[500px] lg:min-h-0 lg:relative">
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 border border-white flex flex-col lg:absolute lg:inset-0 h-full overflow-hidden">
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-3">
                Results
                <span className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-wider ml-auto border border-violet-100 shadow-sm">Live Preview</span>
              </h2>
              {!result && !loading && !improvedResume && (
                <div className="flex-1 border-2 border-dashed border-slate-200/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 relative overflow-hidden group hover:border-violet-200 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 flex items-center justify-center mb-5">
                      <div className="absolute inset-0 bg-violet-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                      <div className="absolute inset-6 bg-violet-600 rounded-full shadow-xl shadow-violet-600/30 flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-500 delay-150">
                        <Target size={24} strokeWidth={2.5} />
                      </div>
                    </div>
                    <h3 className="text-slate-900 font-extrabold text-lg mb-2">Awaiting Your Input</h3>
                    <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-[280px]">
                      Upload a resume and hit scan to reveal your ATS match score and keyword analysis.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex-1 border-2 border-dashed border-slate-200/80 rounded-3xl flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center mt-2">
                    <div className="relative w-20 h-20 mb-4">
                      <div className="absolute inset-0 bg-violet-100 rounded-xl rotate-3 animate-pulse"></div>
                      <div className="absolute inset-0 bg-white rounded-xl -rotate-3 border border-slate-100 shadow-lg flex items-center justify-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                        <FileSearch size={32} className="text-violet-400" />
                      </div>
                    </div>
                    <h3 className="text-slate-900 font-extrabold text-lg mb-2 animate-pulse">Scanning your resume...</h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[220px]">
                      Extracting core skills and calculating compatibility against algorithms.
                    </p>
                  </div>
                </div>
              )}

              {improvedResume && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2 pb-2">
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-2xl">
                    <h3 className="text-green-900 font-bold flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-green-600" />
                      Hooray! AI Improved Resume
                    </h3>
                  </div>
                  <iframe
                    className="bg-white border border-zinc-200 shadow-sm rounded-3xl w-full h-[350px]"
                    srcDoc={improvedResume}
                    onLoad={(e) => {
                      if (e.target.contentDocument) {
                        const style = e.target.contentDocument.createElement('style');
                        style.textContent = 'body { margin: 16px; font-family: "Inter", sans-serif; } style, meta, title, head { display: none !important; }';
                        if (e.target.contentDocument.head) {
                          e.target.contentDocument.head.appendChild(style);
                        }
                      }
                    }}
                  />
                  {/* Send to Resume Builder */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/resume-builder', { state: { improvedHtml: improvedResume, jobTitle } })}
                    className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl text-white bg-violet-600 font-bold hover:bg-violet-700 shadow-lg shadow-violet-600/20 transition-all text-sm uppercase tracking-wider"
                  >
                    <Wand2 className="w-5 h-5" /> Build Full Resume in AI Maker
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (downloadingPdf) return;
                      setDownloadingPdf(true);
                      const toastId = toast.loading('Generating PDF format...');
                      try {
                        const pdfBlob = await resumeService.downloadPdfFromScratch({ resumeHtml: improvedResume });
                        const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `ATS_Optimized_Resume.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
                        toast.success('PDF downloaded!', { id: toastId });
                      } catch (e) {
                        console.error(e);
                        if (e.response?.data instanceof Blob) {
                          try {
                            const text = await e.response.data.text();
                            const errJson = JSON.parse(text);
                            toast.error(errJson.message || 'Failed to generate PDF', { id: toastId });
                          } catch (parseErr) {
                            toast.error('Failed to generate PDF', { id: toastId });
                          }
                        } else {
                          toast.error(e.response?.data?.message || 'Failed to generate PDF', { id: toastId });
                        }
                      } finally {
                        setDownloadingPdf(false);
                      }
                    }}
                    disabled={downloadingPdf}
                    className={`w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl text-white font-bold transition-all text-sm uppercase tracking-wider ${
                      downloadingPdf
                        ? 'bg-zinc-400 cursor-wait shadow-none'
                        : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20'
                    }`}
                  >
                    {downloadingPdf ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Preparing PDF...</>
                    ) : (
                      <><Download className="w-5 h-5" /> Download Beautiful PDF</>
                    )}
                  </motion.button>
                </div>
              )}

              {result && !improvedResume && (
                <div className="space-y-4 animate-in zoom-in-95 duration-500 overflow-y-auto custom-scrollbar flex-1 pr-2 -mr-2 pb-2">
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f4f4f5" strokeWidth="8" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={result.score >= 80 ? '#22c55e' : result.score >= 50 ? '#eab308' : '#ef4444'} strokeWidth="8"
                          strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (283 * ((Math.round(result.score) || 0) / 100))}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-zinc-950">{Math.round(result.score) || 0}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-zinc-900">ATS Match Score</h3>
                      <p className="text-zinc-500 text-xs font-medium mt-0.5">Based on keyword matching and relevance.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Strengths */}
                    <div
                      className="bg-green-50/80 border border-green-100 rounded-2xl p-5 shadow-sm cursor-pointer group hover:bg-green-50 hover:shadow-md transition-all"
                      onClick={() => setViewMoreContent({ title: 'Strengths', content: result.strengths, type: 'green' })}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-green-900">Strengths</h4>
                        <span className="text-[10px] font-bold text-green-700 uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-green-100 px-2 py-0.5 rounded-full">View Full</span>
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap font-medium line-clamp-2">{result.strengths}</p>
                    </div>

                    {/* Missing Keywords */}
                    {result.missingKeywords?.length > 0 && (
                      <div className="bg-red-50/80 border border-red-100 rounded-2xl p-5 shadow-sm">
                        <h4 className="font-bold text-red-900 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-red-700 text-xs font-bold rounded-full border border-red-200 shadow-sm">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    <div
                      className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 shadow-sm cursor-pointer group hover:bg-amber-50 hover:shadow-md transition-all relative overflow-hidden"
                      onClick={() => setViewMoreContent({ title: 'Weaknesses & Gaps', content: result.weaknesses, type: 'amber' })}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-sm text-amber-900">Weaknesses & Gaps</h4>
                        <span className="text-[10px] font-bold text-amber-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-amber-100 px-2 py-0.5 rounded-full">View Full</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap font-medium line-clamp-2">{result.weaknesses}</p>
                    </div>

                    {/* Suggestions */}
                    <div
                      className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 shadow-sm cursor-pointer group hover:bg-blue-50 hover:shadow-md transition-all relative overflow-hidden"
                      onClick={() => setViewMoreContent({ title: 'Actionable Suggestions', content: result.suggestions, type: 'blue' })}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-sm text-blue-900">Actionable Suggestions</h4>
                        <span className="text-[10px] font-bold text-blue-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 px-2 py-0.5 rounded-full">View Full</span>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-wrap font-medium line-clamp-2">{result.suggestions}</p>
                    </div>
                  </div>

                  {/* Improve CTA */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleImproveResume}
                      disabled={improving}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-violet-600/20 transition-all disabled:opacity-70"
                    >
                      {improving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                      {improving ? 'Improving Resume...' : 'Improve Resume with AI'}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Prompt Modal for Guests */}
      <AnimatePresence>
        {showAuthPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setShowAuthPrompt(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-white"
            >
              {/* Lock Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center shadow-inner">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-600/30">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  You've Used Your Free Scan
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                  Create a free account to unlock <span className="font-bold text-violet-600">3 ATS scans</span>, <span className="font-bold text-violet-600">AI resume improvement</span>, interview prep, and more — every day.
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                <div className="space-y-3">
                  {[
                    { text: '3 ATS scans per day', color: 'text-violet-600' },
                    { text: '3 AI resume improvements per day', color: 'text-emerald-600' },
                    { text: '3 AI interview preps per day', color: 'text-blue-600' },
                    { text: 'Full resume builder access', color: 'text-amber-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-4 h-4 ${item.color} shrink-0`} />
                      <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link to="/register" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-950 hover:bg-violet-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-violet-600/30 transition-all uppercase tracking-wider"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create Free Account
                  </motion.button>
                </Link>
                <Link to="/login" className="block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm rounded-2xl hover:border-violet-300 hover:text-violet-700 transition-all uppercase tracking-wider"
                  >
                    <LogIn className="w-5 h-5" />
                    I Already Have an Account
                  </motion.button>
                </Link>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="w-full text-center mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className={`relative z-10 bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl border-2 ${viewMoreContent.type === 'amber' ? 'border-amber-100' :
                  viewMoreContent.type === 'blue' ? 'border-blue-100' :
                    'border-green-100'
                }`}
            >
              <h3 className={`text-2xl font-black mb-4 ${viewMoreContent.type === 'amber' ? 'text-amber-900' :
                  viewMoreContent.type === 'blue' ? 'text-blue-900' :
                    'text-green-900'
                }`}>
                {viewMoreContent.title}
              </h3>
              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className={`text-sm md:text-base leading-relaxed font-medium space-y-4 ${viewMoreContent.type === 'amber' ? 'text-amber-900' :
                    viewMoreContent.type === 'blue' ? 'text-blue-900' :
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
                className="w-full mt-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
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
