import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BrainCircuit, FileText, Target, LogOut, Loader2, Calendar, ShieldAlert, Sparkles, ArrowRight, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardService } from '../services/dashboard.service';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function Dashboard() {
  const { user, logout, logoutAll } = useAuth();
  const [activities, setActivities] = useState([]);
  const [usages, setUsages] = useState({ ats_check: 0, interview_prep: 0, resume_build: 0 });
  const [limits, setLimits] = useState({ ats_check: 3, interview_prep: 3, resume_build: 3 });
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showLogoutOptions, setShowLogoutOptions] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [modalLimit, setModalLimit] = useState(10);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    fetchDashboardData(3);
  }, []);

  const fetchDashboardData = async (limit) => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData(limit);
      setActivities(data.activities || []);
      setTotalActivities(data.totalActivities || 0);
      if (data.usages) setUsages(data.usages);
      if (data.limits) setLimits(data.limits);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showHistoryModal) {
      loadModalHistory(10);
      setModalLimit(10);
    }
  }, [showHistoryModal]);

  const loadModalHistory = async (limitToFetch) => {
    try {
      setLoadingModal(true);
      const data = await dashboardService.getDashboardData(limitToFetch);
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Failed to fetch modal history:", error);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleModalLoadMore = () => {
    const nextLimit = modalLimit + 10;
    setModalLimit(nextLimit);
    loadModalHistory(nextLimit);
  };

  const features = [
    {
      title: 'ATS Scanner',
      desc: 'Check your resume against ATS algorithms',
      icon: <Target className="w-8 h-8 text-violet-600" />,
      link: '/ats-check',
      bg: 'bg-violet-50'
    },
    {
      title: 'Interview Preparation',
      desc: 'Generate tailored interview questions based on your resume',
      icon: <BrainCircuit className="w-8 h-8 text-blue-600" />,
      link: '/interview-prep',
      bg: 'bg-blue-50'
    },
    {
      title: 'Resume Builder',
      desc: 'Create an ATS-friendly resume from scratch',
      icon: <FileText className="w-8 h-8 text-emerald-600" />,
      link: '/resume-builder',
      bg: 'bg-emerald-50'
    }
  ];

  const bgStyle = {
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans relative overflow-hidden selection:bg-violet-200 selection:text-violet-900 pb-20 flex flex-col">
      <Navbar />

      {/* Global Background Elements from Reference */}
      <div className="absolute inset-0 pointer-events-none z-0" style={bgStyle}></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-200/50 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <main className="relative z-10 flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 pt-32 md:pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-8"
        >

          {/* Top Section */}
          <div className="w-full pl-2 mb-2 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                Welcome back, <span className="text-violet-600">{user?.name || "User"}.</span> 👋
              </h1>
              <p className="text-slate-500 text-base md:text-lg">
                Your AI career assistants are ready. Optimize your profile and land that dream role today.
              </p>
            </div>
            {/* Session Controls Dropdown */}
            <div className="flex items-center gap-3 relative z-40">
              <button
                onClick={() => setShowLogoutOptions(!showLogoutOptions)}
                className={`px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2 ${showLogoutOptions ? 'text-red-600 border-red-200 bg-red-50/50' : 'hover:text-red-600 hover:border-red-200'}`}
              >
                <LogOut className="w-4 h-4" /> Logout Account
              </button>

              {showLogoutOptions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLogoutOptions(false)}></div>
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <div className="px-3 py-2 border-b border-slate-50 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Security</p>
                    </div>
                    <button onClick={logout} className="w-full text-left flex items-center gap-3 px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                      <LogOut className="w-4 h-4 text-slate-400" /> Logout Current Device
                    </button>
                    <button onClick={logoutAll} className="w-full text-left flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors mt-1">
                      <ShieldAlert className="w-4 h-4" /> Revoke All Active Devices
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* AI Tools Grid */}
          <div className="mt-2">
            <h2 className="text-2xl font-extrabold flex items-center gap-3 text-slate-900 mb-6 pl-2">
              Available Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <Link to="/ats-check" className="block group h-full">
                <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100/50 group-hover:shadow-[0_12px_40px_rgba(139,92,246,0.08)] transition-all duration-300 flex flex-col h-full group-hover:-translate-y-1">
                  <div className="w-[52px] h-[68px] rounded-[26px] border border-violet-100/60 flex items-center justify-center mb-6 bg-gradient-to-b from-white to-violet-50/50 shadow-[0_2px_12px_rgba(139,92,246,0.06)] group-hover:scale-110 transition-transform">
                    <Target className="w-7 h-7 text-[#7C3AED]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-violet-700 transition-colors">ATS Scanner</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">Check your resume against ATS algorithms</p>
                </div>
              </Link>

              <Link to="/interview-prep" className="block group h-full">
                <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100/50 group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)] transition-all duration-300 flex flex-col h-full group-hover:-translate-y-1">
                  <div className="w-[52px] h-[68px] rounded-[26px] border border-blue-100/60 flex items-center justify-center mb-6 bg-gradient-to-b from-white to-blue-50/50 shadow-[0_2px_12px_rgba(59,130,246,0.06)] group-hover:scale-110 transition-transform">
                    <BrainCircuit className="w-7 h-7 text-[#2563EB]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">Interview Preparation</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">Generate tailored interview questions based on your resume</p>
                </div>
              </Link>

              <Link to="/resume-builder" className="block group h-full">
                <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100/50 group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.08)] transition-all duration-300 flex flex-col h-full group-hover:-translate-y-1">
                  <div className="w-[52px] h-[68px] rounded-[26px] border border-emerald-100/60 flex items-center justify-center mb-6 bg-gradient-to-b from-white to-emerald-50/50 shadow-[0_2px_12px_rgba(16,185,129,0.06)] group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-[#059669]" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-emerald-600 transition-colors">Resume Builder</h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed font-medium">Create an ATS-friendly resume from scratch</p>
                </div>
              </Link>
            </div>
          </div>

          {/* History Section Reimagined */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 mb-12">

            {/* History List */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-6 pl-2">
                <h3 className="text-xl font-extrabold text-slate-900">Recent Activity</h3>
                {totalActivities > 3 && (
                  <button onClick={() => setShowHistoryModal(true)} className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group transition-colors">
                    View All History <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              <div className="bg-white rounded-[32px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100/80 flex-grow">
                {loading && activities.length === 0 ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  </div>
                ) : activities.length > 0 ? (
                  <div>
                    {activities.slice(0, 3).map((activity, index) => (
                      <div key={activity._id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors rounded-[24px] ${index !== Math.min(activities.length, 3) - 1 ? 'border-b border-slate-50' : ''}`}>
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-inner ${activity.type === 'interview' ? 'bg-blue-50 border border-blue-100/50' : 'bg-violet-50 border border-violet-100/50'}`}>
                            {activity.type === 'interview' ? <BrainCircuit className="w-5 h-5 text-blue-600" /> : <Target className="w-5 h-5 text-violet-600" />}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">
                              {activity.type === 'interview' ? 'Interview Preparation' : 'ATS Scan'}
                            </h4>
                            <p className="text-sm text-slate-600 mt-0.5 font-medium line-clamp-1 capitalize">
                              {activity.type === 'interview'
                                ? `Generated technical Q&A for ${activity.title} role`
                                : `Scanned and analyzed resume against ${activity.title} ATS algorithm`}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <p className="text-xs text-slate-500 font-semibold">
                                {new Date(activity.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                        {activity.type === 'interview' ? (
                          <Link to={`/interview-report/${activity._id}`} className="bg-white border border-slate-200 hover:border-violet-200 hover:text-violet-700 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm text-center w-full sm:w-auto">
                            View Report
                          </Link>
                        ) : (
                          <Link to={`/ats-report/${activity._id}`} className="bg-slate-50 border border-slate-200 hover:border-violet-200 hover:bg-white hover:text-violet-700 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm text-center w-full sm:w-auto">
                            View Scan
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 rounded-[20px] bg-slate-50 flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                      <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Activity Yet</h3>
                    <p className="text-slate-500 text-sm font-medium max-w-sm">When you run ATS scans or prepare for interviews, your history will appear here.</p>

                    <Link to="/interview-prep" className="mt-6 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-colors shadow-[0_4px_12px_rgba(139,92,246,0.3)]">
                      Start First Prep
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Limits Card */}
            <div className="lg:col-span-1 bg-white rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 flex flex-col h-full relative overflow-hidden mt-2 lg:mt-0">
              <div className="flex flex-col mb-8 lg:mt-2 gap-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Allowance</h3>
                  <div className="p-2 bg-violet-50 rounded-full">
                    <Clock className="w-4 h-4 text-violet-500" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500">Limits renew at 12:00 Midnight.</p>
              </div>

              <div className="flex flex-col gap-6 flex-grow justify-center lg:pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700">ATS Scans</span>
                    <span className="text-violet-600">{(limits.ats_check || 3) - (usages.ats_check || 0)}/{limits.ats_check || 3}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all duration-1000" style={{ width: `${(((limits.ats_check || 3) - (usages.ats_check || 0)) / (limits.ats_check || 3)) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700">Interview Preparations</span>
                    <span className="text-blue-600">{(limits.interview_prep || 3) - (usages.interview_prep || 0)}/{limits.interview_prep || 3}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(((limits.interview_prep || 3) - (usages.interview_prep || 0)) / (limits.interview_prep || 3)) * 100}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700">Resume Builds</span>
                    <span className="text-emerald-600">{(limits.resume_build || 3) - (usages.resume_build || 0)}/{limits.resume_build || 3}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(((limits.resume_build || 3) - (usages.resume_build || 0)) / (limits.resume_build || 3)) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </main>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => { setShowHistoryModal(false); fetchDashboardData(3); }}></div>

          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900">All Activity History</h3>
                <p className="text-sm text-slate-500 font-medium">Your complete timeline of career optimization.</p>
              </div>
              <button onClick={() => { setShowHistoryModal(false); fetchDashboardData(3); }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-2 overflow-y-auto flex-grow flex flex-col" style={{ scrollbarWidth: 'thin' }}>
              {activities.map((activity, index) => (
                <div key={activity._id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors rounded-[24px] ${index !== activities.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-inner ${activity.type === 'interview' ? 'bg-blue-50 border border-blue-100/50' : 'bg-violet-50 border border-violet-100/50'}`}>
                      {activity.type === 'interview' ? <BrainCircuit className="w-5 h-5 text-blue-600" /> : <Target className="w-5 h-5 text-violet-600" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {activity.type === 'interview' ? 'Interview Preparation' : 'ATS Scan'}
                      </h4>
                      <p className="text-sm text-slate-600 mt-0.5 font-medium line-clamp-1 capitalize">
                        {activity.type === 'interview'
                          ? `Generated technical Q&A for ${activity.title} role`
                          : `Scanned and analyzed resume against ${activity.title} ATS algorithm`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-xs text-slate-500 font-semibold">
                          {new Date(activity.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-end">
                    {activity.type === 'interview' ? (
                      <Link to={`/interview-report/${activity._id}`} className="bg-white border border-slate-200 hover:border-violet-200 hover:text-violet-700 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm text-center w-full sm:w-auto">
                        View Report
                      </Link>
                    ) : (
                      <Link to={`/ats-report/${activity._id}`} className="bg-slate-50 border border-slate-200 hover:border-violet-200 hover:bg-white hover:text-violet-700 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm text-center w-full sm:w-auto">
                        View Scan
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {loadingModal && (
                <div className="flex justify-center p-6 shrink-0">
                  <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 rounded-b-[32px] flex justify-center">
              {activities.length < totalActivities ? (
                <button
                  onClick={handleModalLoadMore}
                  disabled={loadingModal}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20 disabled:opacity-50"
                >
                  Load More Activity
                </button>
              ) : (
                <p className="text-sm font-bold text-slate-400 py-2.5">End of history</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
