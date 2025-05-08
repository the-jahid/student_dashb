

"use client";


import { FeaturesSection } from "@/components/Home/features";
import { HeroScroll } from "@/components/Home/HeroScroll";
import { MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, Navbar, NavbarButton, NavbarLogo, NavBody } from "@/components/Home/resizable-navbar";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";

import { useState } from "react";


export  default function LandingPage() {


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
     
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          {/* <NavItems items={navItems} /> */}
          <div className="flex items-center gap-4">
            <SignedOut>
               <NavbarButton variant="primary"><SignInButton forceRedirectUrl="/dashboard/chatbot" /></NavbarButton>
               {/* <NavbarButton variant="primary"><SignUpButton forceRedirectUrl="/dashboard/chatbot" /></NavbarButton> */}
            </SignedOut>
            <SignedIn>
               <Link  href={'/dashboard/chatbot'}><NavbarButton variant="primary">Dashboard</NavbarButton></Link>
            </SignedIn>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            
            <div className="flex w-full flex-col gap-4">
              <SignedOut>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                <SignInButton forceRedirectUrl="/dashboard/chatbot" />
              </NavbarButton>
              </SignedOut>
              <SignedIn>
               <Link  href={'/dashboard/chatbot'}><NavbarButton className="w-full" variant="primary">Dashboard</NavbarButton></Link>
            </SignedIn>
              
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      
      <HeroScroll />
      <FeaturesSection />
    </div>
  );
}

