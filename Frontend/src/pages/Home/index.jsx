import React, { useEffect } from 'react';
import { Hero } from './Hero';
import { FeaturesBento } from './FeaturesBento';
import { Workflow } from './Workflow';
import { DemoPreview } from './DemoPreview';
import { CTASection } from './CTASection';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import SEO from '../../components/SEO';

export default function Home() {
  useEffect(() => {
    // Inject native smooth scroll behavior seamlessly into the browser root
    document.documentElement.classList.add('scroll-smooth');
    return () => document.documentElement.classList.remove('scroll-smooth');
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden">
      <SEO title="Home" description="Build perfect resumes, beat ATS parsers, and ace interviews with our AI-powered career platform." path="/" />
      <Navbar />
      <main>
        <Hero />
        <FeaturesBento />
        <Workflow />
        <DemoPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
