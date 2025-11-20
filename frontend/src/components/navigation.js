"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';

// Define the navigation links
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/list", label: "List" },
];

export default function Navigation({ isMobile = false, closeMenu }) {
  const pathname = usePathname();
  
  const baseClasses = "font-semibold transition-colors rounded-lg";
  
  return (
    <nav className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
      {navLinks.map((link) => (
        <Link 
          key={link.href} 
          href={link.href} 
          onClick={isMobile ? closeMenu : undefined}
        >
          <Button
            variant="ghost"
            className={`
              ${isMobile ? 'w-full justify-start text-lg py-3' : 'px-4 py-2 text-base'}
              ${baseClasses}
              ${pathname === link.href 
                ? isMobile 
                  ? 'text-white bg-brand-blue hover:bg-brand-blue/90' // Mobile Active
                  : 'text-brand-blue bg-brand-mint/60 shadow-inner'  // Desktop Active
                : isMobile
                  ? 'text-brand-textBlack hover:bg-brand-mint/40' // Mobile Inactive
                  : 'text-brand-textGrey hover:bg-brand-mint/30' // Desktop Inactive
              }
            `}
          >
            {link.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}