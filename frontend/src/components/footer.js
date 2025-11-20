import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand-textBlack text-brand-beige py-4 mt-8 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm">
        
        {/* Copyright and Team */}
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          <p className="font-semibold mb-1">© {currentYear} Chingu V58-tier3-team-36</p>
          <p className="text-brand-textGrey hidden md:block">
            Stack: Next.js, Shadcn/UI, Tailwind, Express, MongoDB.
          </p>
        </div>
        
        {/* GitHub Link */}
        <a 
          href="https://github.com/chingu-voyages/V58-tier3-team-36" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-brand-mint hover:text-white transition-colors font-medium group"
        >
          <Github className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
          <span>View Team Git</span>
        </a>
      </div>
    </footer>
  );
}