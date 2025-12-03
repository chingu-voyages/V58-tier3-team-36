"use client";

import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/navigation";
import {useSession, signOut} from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg bg-white/95 backdrop-blur-sm border-b border-[rgb(var(--color-chingumint))]">
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
              style={{ height: 'auto' }}
            />
            <h1 className="text-xl font-extrabold text-[rgb(var(--color-chingublue))] hidden sm:block">Demographics Explorer</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <Navigation isMobile={false} />
          </div>

          {/* Auth & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
                 {/* Auth Section */}
          <div className="flex items-center gap-4">
          {status === 'authenticated' ? (
            <>
              <span className="text-sm">{session.user.name}</span>
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <Button onClick={() => signOut()} variant="outline" size="sm">
                Sign Out
              </Button>
            </>
          ) : (
            <>
            <Link href="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="inline" className="hover:cursor-pointer text-[rgb(var(--color-chingu-text-grey))]" size="sm">Register</Button>
            </Link>
            </>
          )}
        </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-[rgb(var(--color-chingublue))]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>


        {/* Mobile Dropdown Menu */}
        <div id="mobile-menu" className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-white shadow-inner border-t border-[rgb(var(--color-chingumint))]/50 p-4`}>
          <div className="flex flex-col space-y-2">
            
            {/* Mobile Navigation */}
            <Navigation isMobile={true} closeMenu={closeMobileMenu} />

            <div className="pt-4 border-t mt-4 border-[rgb(var(--color-chingumint))]/50">
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}