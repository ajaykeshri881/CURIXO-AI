import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, path = '' }) => {
  const siteTitle = 'Curixo AI - AI-Powered Career Platform';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'Create ATS-friendly resumes, scan your resume against job descriptions, and prepare for interviews with Curixo AI.';
  const defaultKeywords = 'AI resume builder, ATS checker, interview preparation, career platform, resume optimization';
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://curixoai.ajaykeshri.com';
  const pageUrl = `${baseUrl}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={`${baseUrl}/og-image.jpg`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={`${baseUrl}/og-image.jpg`} />
    </Helmet>
  );
};

export default SEO;
