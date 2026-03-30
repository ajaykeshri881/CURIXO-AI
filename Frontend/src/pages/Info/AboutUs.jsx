import React, { useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import SEO from '../../components/SEO';

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 flex flex-col overflow-x-hidden">
      <SEO title="About Us" description="Learn about Curixo AI, our mission, and how we empower job seekers with AI-driven career tools." path="/about" />
      <Navbar />

      <main className="flex-grow relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          <header className="mb-12 border-b border-slate-200/60 pb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
              About Curixo AI
            </h1>
            <p className="text-slate-500 font-medium">
              Effective Date: March 29, 2026
            </p>
          </header>

          <div className="prose prose-slate prose-lg max-w-none text-slate-600">

            <p className="leading-relaxed mb-6">
              Welcome to Curixo AI. This page outlines the history, mission, and organizational details of our platform. By understanding who we are, we hope to build transparency and trust with the professionals and organizations who utilize our services.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">1. Who We Are</h2>
            <p className="leading-relaxed mb-6">
              Curixo AI is an intelligent career acceleration platform designed to empower job seekers in the modern, AI-driven recruitment landscape. Founded with the vision of democratizing access to professional grade career tools, Curixo AI provides software to analyze, refine, and optimize resumes against Applicant Tracking Systems (ATS) and prepare candidates for technical and behavioral interviews.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">2. Our Mission</h2>
            <p className="leading-relaxed mb-6">
              Our mission is to level the playing field for candidates globally by providing accessible, state-of-the-art AI tools that uncover unseen gaps in their professional profiles. We believe that talent should never go unnoticed due to algorithmic screening constraints. We strive to provide transparent, unbiased, and actionable insights.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">3. Core Values</h2>
            <p className="leading-relaxed mb-6">
              At Curixo AI, all of our platform operations and product developments are guided by the following core principles:
            </p>
            <ul className="list-disc pl-6 space-y-3 mb-6 marker:text-slate-400">
              <li className="pl-2">
                <strong className="text-slate-900 font-bold">Transparency:</strong> We are clear about how our AI models evaluate your data and strictly inform you of what makes a successful applicant profile.
              </li>
              <li className="pl-2">
                <strong className="text-slate-900 font-bold">Accessibility:</strong> We build tools that are affordable and natively intuitive, minimizing the barrier of entry for professionals across all industries.
              </li>
              <li className="pl-2">
                <strong className="text-slate-900 font-bold">Privacy & Security:</strong> We handle user resumes, employment history, and personal contact information with the utmost confidentiality, strictly adhering to modern data protection standards.
              </li>
            </ul>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">4. Open Source & Community</h2>
            <p className="leading-relaxed mb-6">
              Curixo AI strongly believes in the power of the open-source community. Portions of our platform architecture are available for review, contribution, and discussion to foster an ecosystem of continuous improvement and community-driven development in career tech.
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-12 mb-4">5. Contact Information</h2>
            <p className="leading-relaxed mb-6">
              If you have any questions about this About Us page or would like to partner with Curixo AI, please reach out to our team at:
            </p>

            <div className="mt-8 bg-slate-50/50 border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm">
              <div className="space-y-4 text-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-slate-100">
                  <span className="font-bold w-24 text-slate-900">Email</span>
                  <a href="mailto:keshriguide@gmail.com" className="text-violet-600 hover:text-violet-700 hover:underline transition-colors mt-1 sm:mt-0">keshriguide@gmail.com</a>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center py-2">
                  <span className="font-bold w-24 text-slate-900">GitHub</span>
                  <a href="https://github.com/ajaykeshri881" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 hover:underline transition-colors mt-1 sm:mt-0">@ajaykeshri881</a>
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
