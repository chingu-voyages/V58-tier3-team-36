"use client";

import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMobileMenu = () => setIsMenuOpen(false);
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg bg-white/95 backdrop-blur-sm border-b border-brand-mint">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW: Logo, Nav, Auth, Menu Toggle */}
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and App Name */}
          <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
            <Image 
              src="https://www.chingu.io/logo-with-text-192.png" 
              alt="Chingu Logo" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            <h1 className="text-xl font-extrabold text-brand-blue hidden sm:block">Demographics Explorer</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <Navigation isMobile={false} />
          </div>

          {/* Auth & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-brand-blue"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div id="mobile-menu" className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-white shadow-inner border-t border-brand-mint/50 p-4`}>
          <div className="flex flex-col space-y-2">
            
            {/* Mobile Navigation */}
            <Navigation isMobile={true} closeMenu={closeMobileMenu} />

            <div className="pt-4 border-t mt-4 border-brand-mint/50">
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}