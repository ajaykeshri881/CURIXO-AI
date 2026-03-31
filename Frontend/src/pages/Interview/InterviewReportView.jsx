import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService } from '../../services/interview.service';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, BrainCircuit } from 'lucide-react';
import InterviewReportDisplay from '../../components/ui/InterviewReportDisplay';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export default function InterviewReportView() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { interviewReport } = await interviewService.getInterviewReportById(id);
        setReport(interviewReport);
      } catch (_error) {
        toast.error('Failed to load interview report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex-grow relative py-24 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-zinc-900">Report not found</h2>
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium hover:underline mt-4 inline-block transition-colors">Return to Dashboard</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-grow relative pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Soft, modern background gradients */}
        <div className="absolute top-[-10%] sm:top-[0%] right-[-10%] sm:right-[5%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full bg-blue-100/40 blur-3xl opacity-70 mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-[-10%] sm:bottom-[0%] left-[-10%] sm:left-[-5%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full bg-violet-100/40 blur-3xl opacity-70 mix-blend-multiply pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-blue-600" />
              Interview Analysis
            </h1>
            <p className="text-zinc-600 font-medium mt-2">
              Generated on {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white p-2">
            <InterviewReportDisplay report={report} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
