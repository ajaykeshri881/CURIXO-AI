import React, { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 flex flex-col overflow-x-hidden">
      <Navbar />

      <main className="flex-grow relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          <header className="mb-12 border-b border-slate-200/60 pb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-500 font-medium">
              Effective Date: March 29, 2026
            </p>
          </header>

          <div className="prose prose-slate prose-lg max-w-none text-slate-600">

            <p className="leading-relaxed mb-6">
              Welcome to Curixo. By accessing and using our website, platform, and services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">1. Use of Service</h2>
            <p className="leading-relaxed mb-6">
              Curixo provides an AI-powered career platform designed to help users scan resumes, prepare for interviews, and optimize their professional profiles. You agree to use these tools responsibly and strictly for personal career development purposes. Any automated scraping, reverse engineering, or mass extraction of our AI feedback models is strictly prohibited.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">2. User Accounts</h2>
            <p className="leading-relaxed mb-6">
              To utilize certain features of the platform, you must register for an account. You are responsible for maintaining the confidentiality of your account information, including your password, and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">3. Fair Use & Rate Limiting</h2>
            <p className="leading-relaxed mb-6">
              Curixo provides free tier access to its AI features. To protect our infrastructure and ensure fair accessibility for all candidates, we enforce strict daily rate limits. Attempts to bypass these limitations through multiple accounts or proxies may result in permanent suspension of access.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">4. Limitation of Liability</h2>
            <p className="leading-relaxed mb-6">
              Curixo acts as an informational tool. We do not guarantee employment, interviews, or specific career outcomes resulting from the use of our ATS scanner or interview prep tools. The AI-generated feedback is algorithmic and should be reviewed by you before being submitted to employers.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">5. Contact Information</h2>
            <p className="leading-relaxed mb-6">
              If you have any questions or concerns regarding our terms of service, please reach out to our team at:
            </p>

            <div className="mt-8 bg-slate-50/50 border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="space-y-4 text-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center py-2">
                  <span className="font-bold w-24 text-slate-900">Email</span>
                  <a href="mailto:keshriguide@gmail.com" className="text-violet-600 hover:text-violet-700 hover:underline transition-colors mt-1 sm:mt-0">keshriguide@gmail.com</a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
