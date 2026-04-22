import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resumeService } from '../../services/resume.service';
import toast from 'react-hot-toast';
import { FileText, Loader2, Download, CheckCircle2, FileSignature, Layers, ArrowRight, Zap, Code, FileSearch, Clock, Maximize2, Minimize2, Save, Edit3, Bold, Italic, Underline, Link as LinkIcon, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import SEO from '../../components/SEO';

const LOADING_MESSAGES = [
  'Analyzing your career profile...',
  'Structuring the AI document...',
  'Formulating high-impact bullet points...',
  'Applying ATS-optimized formatting...',
  'Polishing the final layout...'
];

const DOWNLOADING_MESSAGES = [
  'Initializing rendering engine...',
  'Compiling HTML to PDF format...',
  'Securing high-quality graphics...',
  'Finalizing document download...'
];

export default function ResumeBuilder() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    jobTitle: '',
    personalDetails: { name: '', email: '', phone: '', location: '', linkedin: '', github: '' },
    summary: '',
    skills: '',
    experience: '',
    education: '',
    projects: '',
    certifications: '',
    achievements: ''
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const downloadLockRef = useRef(false);
  const previewRef = useRef(null);
  const previewViewportRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [retryContext, setRetryContext] = useState(null);
  
  // Link Editor State
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [linkEditTarget, setLinkEditTarget] = useState(null);
  const [linkEditData, setLinkEditData] = useState({ text: '', url: '' });

  const [loadingMessage, setLoadingMessage] = useState('');

  const isServerIssue = (status) => Number.isInteger(status) && status >= 500;

  useEffect(() => {
    let interval;
    if (loading) {
      let i = 0;
      setLoadingMessage(LOADING_MESSAGES[0]);
      interval = setInterval(() => {
        i = (i + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[i]);
      }, 2500);
    } else if (downloading) {
      let i = 0;
      setLoadingMessage(DOWNLOADING_MESSAGES[0]);
      interval = setInterval(() => {
        i = (i + 1) % DOWNLOADING_MESSAGES.length;
        setLoadingMessage(DOWNLOADING_MESSAGES[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading, downloading]);

  useEffect(() => {
    const iframeDoc = previewRef.current?.contentDocument;
    if (!iframeDoc || !iframeDoc.body) return;

    iframeDoc.body.contentEditable = isEditing ? 'true' : 'false';

    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor) {
        e.preventDefault();
        if (isEditing) {
          e.stopPropagation();
          if (typeof window.parent.openLinkEditor === 'function') {
            window.parent.openLinkEditor(anchor);
          }
        } else if (anchor.href) {
          window.open(anchor.href, '_blank');
        }
      }
    };

    const anchors = iframeDoc.querySelectorAll('a');
    anchors.forEach(a => {
      if (isEditing) {
        a.setAttribute('title', 'Click to edit link destination');
        a.classList.add('editing-link');
      } else {
        a.removeAttribute('title');
        a.classList.remove('editing-link');
      }
    });

    iframeDoc.addEventListener('click', handleClick);

    let style = iframeDoc.getElementById('editor-styles');
    if (isEditing && !style) {
      style = iframeDoc.createElement('style');
      style.id = 'editor-styles';
      style.textContent = `
        a.editing-link { outline: 2px dashed #10b981; outline-offset: 2px; border-radius: 2px; cursor: pointer !important; position: relative; display: inline-block; }
        a.editing-link:hover { background: #ecfdf5; box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }
        a.editing-link::after { content: '✎'; position: absolute; top: -10px; right: -10px; background: #10b981; color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
        a.editing-link:hover::after { opacity: 1; }
      `;
      if (iframeDoc.head) iframeDoc.head.appendChild(style);
    } else if (!isEditing && style) {
      style.remove();
    }

    return () => {
      iframeDoc.removeEventListener('click', handleClick);
    };
  }, [isEditing, previewHtml]);

  useEffect(() => {
    if (!previewHtml || !previewViewportRef.current) return;

    window.openLinkEditor = (anchorNode) => {
       setLinkEditTarget(anchorNode);
       setLinkEditData({ text: anchorNode.textContent, url: anchorNode.getAttribute('href') || '' });
       setLinkEditorOpen(true);
    };

    const A4_WIDTH_PX = 794;
    const MIN_SCALE = 0.3;
    const MAX_SCALE = 1;

    const updatePreviewScale = () => {
      if (!previewViewportRef.current) return;
      const viewportWidth = previewViewportRef.current.clientWidth;
      const usableWidth = Math.max(viewportWidth - 56, 320);
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
      delete window.openLinkEditor;
    };
  }, [previewHtml]);

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
    const improvedHtml = location.state?.improvedHtml;
    const improvedJobTitle = location.state?.jobTitle;

    if (improvedHtml) {
      setPreviewHtml(improvedHtml);
      setIsFullscreen(true);
      if (improvedJobTitle) {
        setFormData(prev => ({ ...prev, jobTitle: improvedJobTitle }));
      }
    }
  }, [location.state?.improvedHtml, location.state?.jobTitle]);

  const executeCommand = (command, value = null) => {
    const iframe = previewRef.current;
    if (iframe && iframe.contentDocument) {
      if (command === 'createLink') {
        const selection = iframe.contentWindow.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
          toast.error("Please highlight some text first to create a link.", { icon: '📝' });
          return;
        }

        const dummyUrl = 'http://#temp-link#';
        iframe.contentDocument.execCommand(command, false, dummyUrl);
        
        const anchorNode = iframe.contentDocument.querySelector(`a[href="${dummyUrl}"]`);
        if (anchorNode) {
          anchorNode.setAttribute('target', '_blank');
          setLinkEditTarget(anchorNode);
          setLinkEditData({ text: anchorNode.textContent, url: '' });
          setLinkEditorOpen(true);
        }
      } else {
        iframe.contentDocument.execCommand(command, false, value);
      }
      iframe.contentWindow.focus();
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.jobTitle.trim()) { toast.error("Job Title is required"); return false; }
      if (!formData.personalDetails.name.trim()) { toast.error("Name is required"); return false; }
      if (!formData.personalDetails.email.trim()) { toast.error("Email is required"); return false; }
      return true;
    }
    if (currentStep === 2) {
      if (!formData.education.trim()) { toast.error("Education is required"); return false; }
      return true;
    }
    if (currentStep === 3) {
      if (!formData.skills.trim()) { toast.error("Skills are required"); return false; }
      return true;
    }
    if (currentStep === 4) {
      if (!formData.summary.trim()) { toast.error("Professional Summary is required"); return false; }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleRetryServerAction = async () => {
    if (!retryContext?.action || loading || downloading) return;

    if (retryContext.action === 'generate') {
      await handleSubmit();
      return;
    }

    if (retryContext.action === 'download') {
      await handleDownloadPdf();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    // Prevent generation unless the user is on the final step
    if (currentStep < 4) {
      nextStep();
      return;
    }
    if (!validateStep()) return;
    setRetryContext(null);
    setLoading(true);
    try {
      const mappedData = {
        jobTitle: formData.jobTitle,
        userInfo: {
          personalDetails: formData.personalDetails,
          summary: formData.summary,
          skills: formData.skills.split(',').map(s => s.trim()),
          experience: formData.experience.trim() ? [{ title: 'Professional', description: formData.experience }] : [],
          education: [{ title: 'Education', description: formData.education }],
          projects: formData.projects.trim() ? [{ title: 'Projects', description: formData.projects }] : [],
          extraDetails: `Certifications:\n${formData.certifications}\n\nAchievements:\n${formData.achievements}`
        }
      };

      const response = await resumeService.createFromScratch(mappedData);
      setPreviewHtml(response.resumeHtml);
      setIsEditing(false);
      setIsFullscreen(true);

      toast.success('Preview generated successfully! You can now edit or download it.');
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        setShowLimitPrompt(true);
      } else {
        if (isServerIssue(status)) {
          setRetryContext({
            action: 'generate',
            message: 'Server issue while generating your resume. Please retry.'
          });
        }
        toast.error(error.response?.data?.message || 'Failed to generate resume preview');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (downloading || downloadLockRef.current) return;
    downloadLockRef.current = true;
    setRetryContext(null);
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
      const status = error.response?.status;
      if (isServerIssue(status)) {
        setRetryContext({
          action: 'download',
          message: 'Server issue while generating your PDF. Please retry.'
        });
      }

      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          toast.error(json.message || 'Failed to download PDF', { id: 'resume-pdf-download-error' });
        } catch {
          toast.error('Failed to download PDF', { id: 'resume-pdf-download-error' });
        }
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to download PDF', { id: 'resume-pdf-download-error' });
      }
    } finally {
      downloadLockRef.current = false;
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 flex flex-col overflow-x-hidden">
      <SEO title="AI Resume Builder" description="Instantly generate a professional, highly-optimized, and ATS-friendly PDF resume crafted exactly to your specifications." path="/resume-builder" />
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

                <div className="mt-6 flex items-center justify-center">
                  <span className="px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-100/50 shadow-sm">
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
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className={`relative ${isFullscreen ? 'z-[100]' : 'z-10'} flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 pt-32 md:pt-40 pb-20`}>
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-3">
            <FileText className="hidden md:block text-emerald-600 w-10 h-10 translate-y-1" strokeWidth={3} />
            <span>AI</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Resume Builder</span>
          </h1>
          <p className="mt-4 text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Fill in the details below to instantly generate a professional, highly-optimized, and ATS-friendly PDF resume crafted exactly to your specifications.
          </p>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div>
              <p className="text-sm sm:text-base font-extrabold text-emerald-900">Already have a resume?</p>
              <p className="text-xs sm:text-sm font-medium text-emerald-800 mt-1">
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
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentStep < 4) {
                  e.preventDefault();
                }
              }}
              className="flex flex-col"
            >
              
              {/* Stepper Progress */}
              <div className="mb-8 px-2 sm:px-4">
                <div className="flex items-center justify-between relative">
                  {/* Background Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] bg-slate-200 rounded-full -z-10"></div>
                  {/* Active Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-emerald-500 rounded-full -z-10 transition-all duration-500" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>

                  {[
                    { num: 1, label: 'Basics' },
                    { num: 2, label: 'Edu & Proj' },
                    { num: 3, label: 'Experience' },
                    { num: 4, label: 'Extras' }
                  ].map(step => (
                    <div key={step.num} className="flex flex-col items-center">
                      <button 
                        type="button"
                        onClick={() => {
                          if (step.num < currentStep) setCurrentStep(step.num);
                          else if (step.num === currentStep + 1 && validateStep()) setCurrentStep(step.num);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-[3px] shadow-sm
                          ${currentStep === step.num ? 'bg-white border-emerald-500 text-emerald-600 shadow-md ring-4 ring-emerald-500/10' : 
                            currentStep > step.num ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                      >
                        {currentStep > step.num ? <CheckCircle2 size={18} /> : step.num}
                      </button>
                      <span className={`absolute mt-12 text-[11px] whitespace-nowrap sm:text-xs font-bold uppercase tracking-wider ${currentStep === step.num ? 'text-emerald-700' : currentStep > step.num ? 'text-slate-700' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-6"></div> {/* Spacer for the absolute labels */}
              </div>

              {/* Steps Container */}
              <div className="min-h-[380px]">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6"
                    >
                      {/* Target Role */}
                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Target Job Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                            <FileSignature size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Senior Frontend Developer"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Your actual name"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.personalDetails.name}
                            onChange={(e) => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, name: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="you@email.com"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.personalDetails.email}
                            onChange={(e) => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, email: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                            Phone Number <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.personalDetails.phone}
                            onChange={(e) => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, phone: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                            Location <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="City, State"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.personalDetails.location}
                            onChange={(e) => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, location: e.target.value } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                            LinkedIn Profile <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.personalDetails.linkedin}
                            onChange={(e) => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, linkedin: e.target.value } })}
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                            GitHub / Portfolio <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.personalDetails.github}
                            onChange={(e) => setFormData({ ...formData, personalDetails: { ...formData.personalDetails, github: e.target.value } })}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6"
                    >
                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Education History <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          className="w-full h-24 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                          placeholder="B.Tech in Computer Science, Rajiv Gandhi Proudyogiki Vishwavidyalaya (2018–2022). CGPA: 8.3/10"
                          value={formData.education}
                          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Key Projects <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                        </label>
                        <textarea
                          className="w-full h-32 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                          placeholder="List your key projects here. Include GitHub URLs, live demo links, and the tech stack used... e.g. 'E-Commerce App (React, Node): Built a full stack store...'"
                          value={formData.projects}
                          onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6"
                    >
                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Core Skills <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                            <Layers size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            placeholder="React, Node.js, Python, Leadership..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400 shadow-sm"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          />
                        </div>
                        <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex">
                          <Zap size={14} className="fill-emerald-600" /> Match these skills with the job description for a higher ATS score.
                        </p>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Work Experience <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                        </label>
                        <textarea
                          className="w-full h-44 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                          placeholder="Paste your past jobs and achievements here. E.g. Software Engineer at Google (2020-2023) - Built scalable backends... Be as detailed as you like, the AI will format it perfectly."
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6"
                    >
                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Professional Summary <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          className="w-full h-24 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                          placeholder="A brief overview of your career goals, expertise, and what you bring to the table. (e.g. Dedicated Frontend Developer with 4+ years of experience in React...)"
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Certifications <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                        </label>
                        <textarea
                          className="w-full h-20 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                          placeholder="E.g. AWS Certified Solutions Architect, Complete 2023 Web Dev Bootcamp... (Include verification links if possible)"
                          value={formData.certifications}
                          onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm">
                          Key Achievements <span className="text-slate-400 font-medium text-xs ml-1">(Optional)</span>
                        </label>
                        <textarea
                          className="w-full h-20 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all resize-none placeholder:text-slate-400 shadow-sm leading-relaxed"
                          placeholder="E.g. Employee of the Month, Won College Hackathon, Published a research paper..."
                          value={formData.achievements}
                          onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 transition-all ml-auto flex items-center gap-2 active:scale-[0.98]"
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      ml-auto px-8 py-3.5 font-bold text-sm rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl 
                      ${loading
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 cursor-wait'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:shadow-emerald-600/40 active:scale-[0.98]'
                    }
                    `}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-white/90" />
                        GENERATING...
                      </>
                    ) : (
                      <>
                        <Zap size={18} className="text-emerald-100 fill-emerald-100" />
                        GENERATE PREVIEW
                        <ArrowRight size={18} className="opacity-90 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className={previewHtml && isFullscreen ? "fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 md:p-10 animate-in fade-in" : "lg:col-span-6 flex flex-col items-start lg:sticky lg:top-28 w-full pb-8"}>
            {!previewHtml ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 border border-white w-full relative overflow-hidden">
                <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-3">
                  How it works
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider ml-auto border border-emerald-100 shadow-sm">Information</span>
                </h2>

                {retryContext && !loading && !downloading && (
                  <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm font-semibold text-rose-700">{retryContext.message}</p>
                    <button
                      type="button"
                      onClick={handleRetryServerAction}
                      className="mt-3 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-rose-700"
                    >
                      {retryContext.action === 'download' ? 'Retry PDF Download' : 'Retry Generate'}
                    </button>
                  </div>
                )}

                <div className="flex flex-col justify-start space-y-5 animate-in fade-in duration-500 mt-2">

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                      <span className="font-bold text-emerald-700">1</span>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-bold text-slate-900 text-sm">Provide Basic Details</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">Fill in the core information about yourself, your target role, and past experience so the AI contextually understands your profile.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                      <span className="font-bold text-emerald-700">2</span>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-bold text-slate-900 text-sm">Review Edit & Preview</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">Click 'Generate Preview' to receive your interactive HTML format that you can view and edit freely.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm border border-emerald-200">
                      <span className="font-bold text-emerald-700">3</span>
                    </div>
                    <div className="pt-1">
                      <h3 className="font-bold text-slate-900 text-sm">Download Instantly</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">Instantly compile and download the flawlessly crafted, professional PDF to directly hand to your next employer.</p>
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
              <div className={isFullscreen ? "bg-white rounded-[2rem] p-4 sm:p-6 shadow-2xl w-full h-full max-w-6xl flex flex-col relative animate-in zoom-in-95 duration-300 border border-emerald-100" : "bg-white/80 backdrop-blur-sm rounded-[2rem] p-4 sm:p-6 shadow-xl shadow-slate-200/40 border border-white w-full h-[78vh] lg:h-[88vh] max-h-[980px] flex flex-col relative animate-in zoom-in-95 duration-500"}>
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
                      className={`relative flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl transition-all shadow-lg group overflow-hidden
                        ${isEditing
                          ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/40 ring-2 ring-amber-500 ring-offset-2 hover:-translate-y-0.5'
                          : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                    >
                      {isEditing && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>}
                      
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      {isEditing ? <Save size={18} className="relative z-10" /> : <Edit3 size={18} className="relative z-10" />}
                      <span className="hidden sm:inline relative z-10 uppercase tracking-wide">{isEditing ? 'Save Changes' : 'Edit Document'}</span>
                      <span className="sm:hidden relative z-10 uppercase tracking-wide">{isEditing ? 'Save' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all shadow-sm 
                        ${isFullscreen 
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}`}
                      title={isFullscreen ? "Minimize Screen" : "Expand Fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                  </div>
                </div>

                {retryContext && !loading && !downloading && (
                  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm font-semibold text-rose-700">{retryContext.message}</p>
                    <button
                      type="button"
                      onClick={handleRetryServerAction}
                      className="mt-3 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-rose-700"
                    >
                      {retryContext.action === 'download' ? 'Retry PDF Download' : 'Retry Generate'}
                    </button>
                  </div>
                )}

                <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden relative mb-4 flex flex-col transform-gpu bg-slate-100 shadow-inner">
                  {/* Rich Text Editor Toolbar */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 z-10"
                      >
                        <button onClick={() => executeCommand('bold')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Bold">
                          <Bold size={16} />
                        </button>
                        <button onClick={() => executeCommand('italic')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Italic">
                          <Italic size={16} />
                        </button>
                        <button onClick={() => executeCommand('underline')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Underline">
                          <Underline size={16} />
                        </button>
                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                        <button onClick={() => executeCommand('justifyLeft')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Align Left">
                          <AlignLeft size={16} />
                        </button>
                        <button onClick={() => executeCommand('justifyCenter')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Align Center">
                          <AlignCenter size={16} />
                        </button>
                        <button onClick={() => executeCommand('justifyRight')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Align Right">
                          <AlignRight size={16} />
                        </button>
                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                        <button onClick={() => executeCommand('insertUnorderedList')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Bullet List">
                          <List size={16} />
                        </button>
                        <button onClick={() => executeCommand('createLink')} className="p-2 rounded hover:bg-slate-200 text-slate-700 transition" title="Insert Link">
                          <LinkIcon size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    ref={previewViewportRef}
                    className="w-full h-full overflow-auto bg-slate-200/50 flex justify-center items-start p-3 sm:p-5"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <div className="flex justify-center transition-all duration-300 relative" style={{ width: `calc(210mm * ${previewScale})`, minHeight: `calc(297mm * ${previewScale})` }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '210mm', transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
                        <iframe
                          id="resume-preview-content"
                          ref={previewRef}
                          srcDoc={previewHtml}
                          className={`bg-white transition-all max-w-none ${isEditing ? 'outline-none ring-4 ring-emerald-500/40 shadow-2xl' : 'shadow-xl'}`}
                          style={{
                            width: '210mm',
                            minHeight: '297mm',
                            border: 'none',
                            display: 'block'
                          }}
                          onLoad={(e) => {
                            const iframe = e.target;
                            if (iframe.contentDocument && iframe.contentDocument.body) {
                              iframe.contentDocument.body.style.margin = '0';
                              iframe.contentDocument.body.contentEditable = isEditing ? 'true' : 'false';

                              const adjustHeight = () => {
                                if (iframe.contentDocument) {
                                  const body = iframe.contentDocument.body;
                                  const html = iframe.contentDocument.documentElement;
                                  // Ensure we get the absolute max height
                                  const newHeight = Math.max(
                                    body.scrollHeight, body.offsetHeight,
                                    html.clientHeight, html.scrollHeight, html.offsetHeight
                                  ) + 50; // Add 50px buffer to prevent custom margin cutoffs

                                  iframe.style.height = `${newHeight}px`;
                                  if (iframe.parentElement && iframe.parentElement.parentElement) {
                                    const scaledHeight = Math.ceil(newHeight * previewScale) + 80;
                                    iframe.parentElement.parentElement.style.minHeight = `${scaledHeight}px`;
                                    iframe.parentElement.parentElement.style.height = `${scaledHeight}px`;
                                  }
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
                              style.textContent = '::-webkit-scrollbar { display: none; } html { scrollbar-width: none; } style, meta, title, head { display: none !important; }';
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
                  Curixo AI provides high-quality AI processing completely <span className="font-bold text-orange-600">for free</span>. To keep this sustainable for everyone without charging subscriptions, we use a fair-use daily limit.
                </p>

                {/* Live Countdown */}
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

      {/* Link Editor Modal */}
      <AnimatePresence>
        {linkEditorOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-white"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileSignature className="text-emerald-500 w-5 h-5" /> Edit Hyperlink
              </h3>
              
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">Display Text</label>
                <input 
                  type="text"
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400"
                  value={linkEditData.text} 
                  onChange={(e) => setLinkEditData({ ...linkEditData, text: e.target.value })} 
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2">Destination URL</label>
                <input 
                  type="url"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-400"
                  value={linkEditData.url} 
                  onChange={(e) => setLinkEditData({ ...linkEditData, url: e.target.value })} 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    if (linkEditTarget && linkEditTarget.getAttribute('href') === 'http://#temp-link#') {
                      const parent = linkEditTarget.parentNode;
                      while(linkEditTarget.firstChild) {
                         parent.insertBefore(linkEditTarget.firstChild, linkEditTarget);
                      }
                      parent.removeChild(linkEditTarget);
                    }
                    setLinkEditorOpen(false);
                  }} 
                  className="px-5 py-2.5 font-bold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (linkEditTarget) {
                      linkEditTarget.textContent = linkEditData.text;
                      linkEditTarget.setAttribute('href', linkEditData.url);
                      toast.success('Link applied perfectly!');
                    }
                    setLinkEditorOpen(false);
                  }} 
                  className="px-6 py-2.5 font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
                >
                  Save Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
