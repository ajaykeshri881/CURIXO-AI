import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resumeService } from '../services/resume.service';
import toast from 'react-hot-toast';
import { FileText, Loader2, Download, CheckCircle2, FileSignature, Layers, ArrowRight, Zap, Code, FileSearch, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function ResumeBuilder() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    jobTitle: '',
    personalDetails: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    skills: '',
    experience: '',
    projects: '',
    extraDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const previewRef = useRef(null);
  const previewViewportRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);

  const [loadingMessage, setLoadingMessage] = useState('');

  const loadingMessages = [
    "Analyzing your career profile...",
    "Structuring the AI document...",
    "Formulating high-impact bullet points...",
    "Applying ATS-optimized formatting...",
    "Polishing the final layout..."
  ];

  const downloadingMessages = [
    "Initializing rendering engine...",
    "Compiling HTML to PDF format...",
    "Securing high-quality graphics...",
    "Finalizing document download..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      let i = 0;
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2500);
    } else if (downloading) {
      let i = 0;
      setLoadingMessage(downloadingMessages[0]);
      interval = setInterval(() => {
        i = (i + 1) % downloadingMessages.length;
        setLoadingMessage(downloadingMessages[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading, downloading]);

  useEffect(() => {
    if (previewRef.current && previewRef.current.contentDocument && previewRef.current.contentDocument.body) {
      previewRef.current.contentDocument.body.contentEditable = isEditing ? 'true' : 'false';
    }
  }, [isEditing]);

  useEffect(() => {
    if (!previewHtml || !previewViewportRef.current) return;

    const A4_WIDTH_PX = 794;
    const MIN_SCALE = 0.72;
    const MAX_SCALE = 1;

    const updatePreviewScale = () => {
      if (!previewViewportRef.current) return;
      const viewportWidth = previewViewportRef.current.clientWidth;
      const usableWidth = Math.max(viewportWidth - 28, 320);
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, usableWidth / A4_WIDTH_PX));
      setPreviewScale(Number(nextScale.toFixed(3)));
    };

    updatePreviewScale();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updatePreviewScale);
      resizeObserver.observe(previewViewportRef.current);
    }

    window.addEventListener('resize', updatePreviewScale);
    window.addEventListener('orientationchange', updatePreviewScale);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updatePreviewScale);
      window.removeEventListener('orientationchange', updatePreviewScale);
    };
  }, [previewHtml]);

  // If arriving from ATS page with improved resume HTML, pre-load it
  useEffect(() => {
    if (location.state?.improvedHtml) {
      setPreviewHtml(location.state.improvedHtml);
      if (location.state.jobTitle) {
        setFormData(prev => ({ ...prev, jobTitle: location.state.jobTitle }));
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const mappedData = {
        jobTitle: formData.jobTitle,
        userInfo: {
          personalDetails: formData.personalDetails,
          skills: formData.skills.split(',').map(s => s.trim()),
          experience: [{ title: 'Professional', company: 'Various', description: formData.experience }],
          projects: formData.projects ? [{ title: 'Projects', description: formData.projects }] : [],
          extraDetails: formData.extraDetails
        }
      };
      
      const response = await resumeService.createFromScratch(mappedData);
      setPreviewHtml(response.resumeHtml);
      setIsEditing(false);
      
      toast.success('Preview generated successfully! You can now edit or download it.');
    } catch (error) {
      if (error.response?.status === 429) {
        setShowLimitPrompt(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to generate resume preview');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const contentEl = document.getElementById('resume-preview-content');
      let finalHtml = previewHtml;

      if (isEditing && contentEl && contentEl.contentDocument) {
        finalHtml = contentEl.contentDocument.documentElement.outerHTML;
      }

      if (typeof finalHtml === 'string') {
        finalHtml = finalHtml
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/\s(?:src|href)=(['"])(?:chrome-extension|moz-extension|safari-web-extension):[^'"]*\1/gi, '');
      }

      if (!finalHtml || !String(finalHtml).trim()) {
        throw new Error('Resume preview is empty. Please generate preview first.');
      }
      
      const pdfBlob = await resumeService.downloadPdfFromScratch({ resumeHtml: finalHtml });

      const downloadBlob = pdfBlob instanceof Blob
        ? pdfBlob
        : new Blob([pdfBlob], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Resume PDF downloaded successfully!');
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          toast.error(json.message || 'Failed to download PDF');
        } catch {
          toast.error('Failed to download PDF');
        }
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to download PDF');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Full Screen Dynamic Loading Overlay */}
      <AnimatePresence>
        {(loading || downloading) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/70 backdrop-blur-md"
          >
            <div className="bg-white px-8 py-10 rounded-[2rem] shadow-2xl border border-emerald-100 flex flex-col items-center max-w-sm w-full relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-teal-50 opacity-50" />
               <div className="relative z-10 flex flex-col items-center">
                 <div className="w-20 h-20 mb-6 relative">
                   <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
                   <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                     <Zap className="w-8 h-8 animate-pulse" />
                   </div>
                 </div>
                 
                 <h3 className="text-xl font-black text-slate-900 mb-2">
                   {loading ? "AI is Working" : "Generating PDF"}
                 </h3>
                 
                 <div className="h-6 flex items-center justify-center overflow-hidden w-full">
                   <AnimatePresence mode="wait">
                     <motion.p
                       key={loadingMessage}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       transition={{ duration: 0.3 }}
                       className="text-sm font-semibold text-emerald-700 text-center"
                     >
                       {loadingMessage}
                     </motion.p>
                   </AnimatePresence>
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
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="relative z-10 max-w-[1500px] w-full mx-auto px-4 pt-24 lg:pt-28 pb-12 flex-grow">
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-3">
            <FileText className="hidden md:block text-emerald-600 w-10 h-10 translate-y-1" strokeWidth={3} />
            <span>AI</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Resume Builder</span>
          </h1>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Fill in the details below to instantly generate a professional, highly-optimized, and ATS-friendly PDF resume crafted exactly to your specifications.
          </p>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shadow-sm">
            <div>
              <p className="text-sm sm:text-base font-extrabold text-emerald-900">Already have a resume?</p>
              <p className="text-xs sm:text-sm font-medium text-emerald-800/90 mt-0.5">
                Check ATS score, identify missing keywords, and improve your resume instantly.
              </p>
            </div>
            <Link
              to="/ats-check"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-bold transition-colors shadow-lg shadow-emerald-600/20"
            >
              Check & Improve Resume
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 border border-white">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Step 1: Target Role */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm shadow-sm">1</span>
                  Target Job Title
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                    <FileSignature size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text" required
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  />
                </div>
              </div>

              {/* Step 2: Details */}
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-100 text-teal-700 text-sm shadow-sm">2</span>
                      Full Name
                    </label>
                    <input
                      type="text" required
                      placeholder="Your actual name"
                      className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-slate-400 shadow-sm"
                      value={formData.personalDetails.name}
                      onChange={(e) => setFormData({...formData, personalDetails: {...formData.personalDetails, name: e.target.value}})}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                      Email
                    </label>
                    <input
                      type="email" required
                      placeholder="you@email.com"
                      className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-slate-400 shadow-sm"
                      value={formData.personalDetails.email}
                      onChange={(e) => setFormData({...formData, personalDetails: {...formData.personalDetails, email: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-slate-400 shadow-sm"
                      value={formData.personalDetails.linkedin}
                      onChange={(e) => setFormData({...formData, personalDetails: {...formData.personalDetails, linkedin: e.target.value}})}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                      GitHub / Portfolio (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-slate-400 shadow-sm"
                      value={formData.personalDetails.github}
                      onChange={(e) => setFormData({...formData, personalDetails: {...formData.personalDetails, github: e.target.value}})}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Core Competencies */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 text-sm shadow-sm">3</span>
                  Skills (comma separated)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-cyan-500">
                    <Layers size={20} className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="text" required
                    placeholder="React, Node.js, Python, Leadership..."
                    className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all placeholder:text-slate-400 shadow-sm"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
                </div>
              </div>

              {/* Step 4: Work Experience */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-sm shadow-sm">4</span>
                  Experience Summary
                </label>
                <textarea
                  required
                  className="w-full h-28 bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all resize-none placeholder:text-slate-400 shadow-sm"
                  placeholder="Paste or write a summary of your professional experience, major achievements, and responsibilities here..."
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>

              {/* Step 5: Projects */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-100 text-violet-700 text-sm shadow-sm">5</span>
                  Projects & Links
                </label>
                <textarea
                  className="w-full h-24 bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all resize-none placeholder:text-slate-400 shadow-sm"
                  placeholder="List your key projects here. Include GitHub URLs, live demo links, and the tech stack used..."
                  value={formData.projects}
                  onChange={(e) => setFormData({...formData, projects: e.target.value})}
                />
              </div>

              {/* Step 6: Extra Details */}
              <div>
                <label className="flex items-center gap-3 font-bold text-slate-900 mb-2 text-base">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-fuchsia-100 text-fuchsia-700 text-sm shadow-sm">6</span>
                  Extra Details (Optional)
                </label>
                <textarea
                  className="w-full h-20 bg-slate-50/80 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 focus:border-fuchsia-400 transition-all resize-none placeholder:text-slate-400 shadow-sm"
                  placeholder="Additional context, education history, awards, or anything else you'd like the AI to include..."
                  value={formData.extraDetails}
                  onChange={(e) => setFormData({...formData, extraDetails: e.target.value})}
                />
              </div>

              <button 
                  type="submit"
                  disabled={loading}
                  className={`
                    group w-full font-bold text-base rounded-2xl py-3.5 mt-1 flex items-center justify-center gap-3 transition-all duration-300 shadow-xl 
                    ${loading
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30 cursor-wait'
                        : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-slate-900/20 hover:shadow-emerald-600/30 active:scale-[0.98]'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 size={22} className="animate-spin text-white/90" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <Zap size={22} className="text-emerald-400" />
                      GENERATE PREVIEW
                      <ArrowRight size={22} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
            </form>
          </div>

          <div className="lg:col-span-6 flex flex-col items-start lg:sticky lg:top-28 w-full pb-8">
            {!previewHtml ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 border border-white w-full relative overflow-hidden">
               <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-3">
                 How it works
                 <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider ml-auto border border-emerald-100 shadow-sm">Information</span>
               </h2>
               
               <div className="flex flex-col justify-start space-y-5 animate-in fade-in duration-500 mt-2">
                 
                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                     <span className="font-bold text-emerald-700">1</span>
                   </div>
                   <div className="pt-1">
                     <h3 className="font-bold text-slate-900 text-sm">Provide Basic Details</h3>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Fill in the core information about yourself, your target role, and past experience so the AI contextually understands your profile.</p>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                     <span className="font-bold text-emerald-700">2</span>
                   </div>
                   <div className="pt-1">
                     <h3 className="font-bold text-slate-900 text-sm">Review Edit & Preview</h3>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Click 'Generate Preview' to receive your interactive HTML format that you can view and edit freely.</p>
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                     <span className="font-bold text-emerald-700">3</span>
                   </div>
                   <div className="pt-1">
                     <h3 className="font-bold text-slate-900 text-sm">Download Instantly</h3>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed">Instantly compile and download the flawlessly crafted, professional PDF to directly hand to your next employer.</p>
                   </div>
                 </div>
                 
                 <div className="mt-4 pt-6 border-t border-slate-100">
                   <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/50 shadow-inner">
                     <h4 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                       <Zap className="w-4 h-4 text-emerald-600" /> Wait, a Pro Tip!
                     </h4>
                     <p className="text-xs text-emerald-800 leading-relaxed font-medium">To get a 100% matched ATS score, explicitly match the <strong>Skills</strong> you insert here directly with the skills specified on the corporate job description!</p>
                   </div>
                 </div>
               </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-4 sm:p-6 shadow-xl shadow-slate-200/40 border border-white w-full h-[78vh] lg:h-[88vh] max-h-[980px] flex flex-col relative animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileSearch className="text-emerald-500 w-5 h-5" /> Preview & Edit
                  </h2>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                      <Layers size={13} /> {Math.round(previewScale * 100)}% Fit
                    </div>
                    <button 
                      onClick={() => setIsEditing(!isEditing)} 
                      className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm
                        ${isEditing 
                           ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700' 
                           : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      {isEditing ? <FileSearch size={16} /> : <FileSignature size={16} />}
                      {isEditing ? 'View Final / Ready' : 'Edit Text Visually'}
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden relative mb-4 flex transform-gpu bg-slate-100 shadow-inner">
                  <div
                    ref={previewViewportRef}
                    className="w-full h-full overflow-auto bg-slate-200/50 flex justify-center items-start p-3 sm:p-5"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <iframe 
                      id="resume-preview-content"
                      ref={previewRef}
                      srcDoc={previewHtml}
                      className={`transform origin-top transition-all bg-white max-w-none ${isEditing ? 'outline-none ring-4 ring-emerald-500/40 shadow-2xl' : 'shadow-xl'}`} 
                      style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top center',
                        width: '210mm',
                        minHeight: '297mm',
                        border: 'none'
                      }}
                      onLoad={(e) => {
                          const iframe = e.target;
                          if (iframe.contentDocument && iframe.contentDocument.body) {
                              iframe.contentDocument.body.style.margin = '0';
                              iframe.contentDocument.body.contentEditable = isEditing ? 'true' : 'false';
                              
                              const adjustHeight = () => {
                                  if (iframe.contentDocument && iframe.contentDocument.documentElement) {
                                      iframe.style.height = `${iframe.contentDocument.documentElement.scrollHeight}px`;
                                  }
                              };

                              if (iframe.contentWindow && iframe.contentWindow.ResizeObserver) {
                                  const ro = new iframe.contentWindow.ResizeObserver(adjustHeight);
                                  ro.observe(iframe.contentDocument.body);
                              } else {
                                  iframe.contentDocument.body.addEventListener('input', adjustHeight);
                                  setTimeout(adjustHeight, 100);
                              }

                              const style = iframe.contentDocument.createElement('style');
                              style.textContent = '::-webkit-scrollbar { display: none; } html { scrollbar-width: none; overflow: hidden !important; } style, meta, title, head { display: none !important; }';
                              if (iframe.contentDocument.head) {
                                  iframe.contentDocument.head.appendChild(style);
                              }
                              // Set initial height
                              setTimeout(adjustHeight, 50);
                          }
                      }}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className={`
                    w-full font-black text-sm uppercase tracking-wider rounded-2xl py-4 flex items-center justify-center gap-3 transition-all duration-300 shadow-xl
                    ${downloading 
                        ? 'bg-slate-400 text-white cursor-wait' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5'}
                  `}
                >
                  {downloading ? (
                    <><Loader2 size={20} className="animate-spin" /> COMPILING FINAL DOCUMENT...</>
                  ) : (
                    <><Download size={20} /> DOWNLOAD SAVED PDF</>
                  )}
                </button>
              </div>
            )}
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
                  Curixo provides high-quality AI processing completely <span className="font-bold text-orange-600">for free</span>. To keep this sustainable for everyone without charging subscriptions, we use a fair-use daily limit.
                </p>
                <div className="mt-5 p-4 bg-orange-50 border border-orange-100 rounded-2xl shadow-inner">
                  <p className="text-orange-800 text-sm font-bold">Please come back tomorrow when your AI usages reset!</p>
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

      <Footer />
    </div>
  );
}
