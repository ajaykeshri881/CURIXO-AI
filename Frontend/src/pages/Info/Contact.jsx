import React, { useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import SEO from '../../components/SEO';

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 flex flex-col overflow-x-hidden">
      <SEO title="Contact Us" description="Get in touch with the Curixo AI team. We're here to help you accelerate your career." path="/contact" />
      <Navbar />

      <main className="flex-grow relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          <header className="mb-12 border-b border-slate-200/60 pb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
              Contact Us
            </h1>
            <p className="text-slate-500 font-medium">
              We're here to help you accelerate your career.
            </p>
          </header>

          <div className="prose prose-slate prose-lg max-w-none text-slate-600">

            <p className="leading-relaxed mb-6">
              Thank you for choosing Curixo AI. Whether you have a question about utilizing our AI resume scanner, need assistance with your account, or want to provide feedback on our interview preparation tools, our team is ready to listen.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">1. General Inquiries & Support</h2>
            <p className="leading-relaxed mb-6">
              For any general questions, technical troubleshooting, or account-specific support, the fastest way to reach us is via email. We aim to respond to all inquiries within 24 to 48 hours.
            </p>

            <div className="mt-8 bg-slate-50/50 border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="space-y-4 text-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center py-2">
                  <span className="font-bold w-32 text-slate-900">Support Email</span>
                  <a href="mailto:keshriguide@gmail.com" className="text-violet-600 hover:text-violet-700 hover:underline transition-colors mt-1 sm:mt-0">keshriguide@gmail.com</a>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">2. Open Source & Contributions</h2>
            <p className="leading-relaxed mb-6">
              Curixo AI is a platform built for the professional community. If you encountered a bug, have a feature request, or wish to contribute to the open-source portions of our codebase, you can reach out directly via our official GitHub repository. We welcome pull requests and issue submissions.
            </p>

            <div className="mt-8 bg-slate-50/50 border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="space-y-4 text-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center py-2">
                  <span className="font-bold w-32 text-slate-900">GitHub</span>
                  <a href="https://github.com/ajaykeshri881" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 hover:underline transition-colors mt-1 sm:mt-0">@ajaykeshri881</a>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">3. Business Inquiries</h2>
            <p className="leading-relaxed mb-6">
              For partnerships, media requests, or API integrations, please specify "Business Inquiry" in the subject line of your email. We are particularly interested in aligning with educational institutions and career coaching services to integrate our AI solutions.
            </p>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
