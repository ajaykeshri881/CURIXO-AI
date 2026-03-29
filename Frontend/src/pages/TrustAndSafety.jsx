import React, { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-slate-500 font-medium">
              Effective Date: March 29, 2026
            </p>
          </header>

          <div className="prose prose-slate prose-lg max-w-none text-slate-600">

            <p className="leading-relaxed mb-6">
              Welcome to Curixo AI. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our platform and services.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">
              1. Information We Collect
            </h2>
            <p className="leading-relaxed mb-6">
              We may collect personal information such as your name, email address, resume data, and usage activity when you interact with our platform. This information is used to provide and improve our AI-powered services.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-6">
              The collected data is used to enhance your experience, provide personalized AI feedback, improve our tools, and ensure platform security. We do not sell your personal data to third parties.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">
              3. Data Security
            </h2>
            <p className="leading-relaxed mb-6">
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">
              4. Cookies & Tracking
            </h2>
            <p className="leading-relaxed mb-6">
              Curixo AI may use cookies and similar technologies to improve user experience, analyze usage, and enhance performance. You can control cookie preferences through your browser settings.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">
              5. User Rights
            </h2>
            <p className="leading-relaxed mb-6">
              You have the right to access, update, or delete your personal data. If you wish to exercise these rights, please contact us using the details below.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">
              6. Changes to This Policy
            </h2>
            <p className="leading-relaxed mb-6">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">
              7. Contact Information
            </h2>
            <p className="leading-relaxed mb-6">
              If you have any questions regarding this Privacy Policy, please contact us:
            </p>

            <div className="mt-8 bg-slate-50/50 border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="space-y-4 text-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center py-2">
                  <span className="font-bold w-24 text-slate-900">Email</span>
                  <a
                    href="mailto:keshriguide@gmail.com"
                    className="text-violet-600 hover:text-violet-700 hover:underline transition-colors mt-1 sm:mt-0"
                  >
                    keshriguide@gmail.com
                  </a>
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