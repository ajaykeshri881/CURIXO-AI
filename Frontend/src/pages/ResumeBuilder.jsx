import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resumeService } from '../services/resume.service';
import toast from 'react-hot-toast';
import { FileText, Loader2, Download, CheckCircle2, FileSignature, Layers, ArrowRight, Zap, Code, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';
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
      toast.error('Failed to generate resume preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const contentEl = document.getElementById('resume-preview-content');
      const finalHtml = contentEl ? contentEl.innerHTML : previewHtml;
      
      const pdfBlob = await resumeService.downloadPdfFromScratch({ resumeHtml: finalHtml });
      
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Resume PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 flex flex-col overflow-x-hidden">
      <Navbar />

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

      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 pt-24 lg:pt-28 pb-12 flex-grow">
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-3">
            <FileText className="hidden md:block text-emerald-600 w-10 h-10 translate-y-1" strokeWidth={3} />
            <span>AI</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Resume Builder</span>
          </h1>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto md:mx-0 font-medium leading-relaxed">
            Fill in the details below to instantly generate a professional, highly-optimized, and ATS-friendly PDF resume crafted exactly to your specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 border border-white">
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

          <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28 w-full pb-8">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-white w-full h-[85vh] flex flex-col relative animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileSearch className="text-emerald-500 w-5 h-5" /> Preview & Edit
                  </h2>
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
                
                <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden relative mb-4 flex transform-gpu bg-slate-100 shadow-inner">
                  <div className="w-full h-full overflow-y-auto bg-white flex justify-center py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div 
                      id="resume-preview-content"
                      contentEditable={isEditing}
                      suppressContentEditableWarning={true}
                      className={`transform origin-top transition-all h-max pb-8 ${isEditing ? 'outline-none ring-4 ring-emerald-500/20 shadow-xl p-4 bg-slate-50' : ''}`} 
                      style={{ transform: 'scale(0.8)', width: '100%', maxWidth: '210mm', minHeight: '297mm' }}
                      dangerouslySetInnerHTML={{ __html: previewHtml }} 
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
      <Footer />
    </div>
  );
}
