"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { BotIcon, File, Home,  ChevronLeft, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { LanguageProvider } from "@/contexts/language-context"
import Image from "next/image"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Check if the screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Close mobile sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileOpen(false)
    }
  }, [isMobile])

  const links = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Chat",
      href: "/dashboard/chatbot",
      icon: <BotIcon className="h-5 w-5 shrink-0" />,
    },
    {
      label: "File Upload",
      href: "/dashboard/file",
      icon: <File className="h-5 w-5 shrink-0" />,
    }
  ]

  // Sidebar content component to avoid duplication
  const SidebarContent = () => (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col justify-between h-full">
        <div>
          {/* Logo or brand */}
          <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-800 px-4 md:px-0 md:justify-center">
            <div className={cn("flex items-center", !isCollapsed || isMobile ? "justify-start" : "justify-center")}>
              <div className="h-8 w-8 rounded-full bg-black dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-black text-sm font-bold">v0</span>
              </div>
              {(!isCollapsed || isMobile) && <span className="ml-3 font-semibold">Dashboard</span>}
            </div>

            {/* Mobile close button */}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation links */}
          <nav className="mt-6 px-2">
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  {isCollapsed && !isMobile ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={link.href}
                          className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto"
                        >
                          {React.cloneElement(link.icon, {
                            className: cn(link.icon.props.className, "text-gray-600 dark:text-gray-400"),
                          })}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="right">{link.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <a
                      href={link.href}
                      className="flex items-center h-10 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 group"
                    >
                      {React.cloneElement(link.icon, {
                        className: cn(
                          link.icon.props.className,
                          "text-gray-600 group-hover:text-primary dark:text-gray-400",
                        ),
                      })}
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">{link.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* User profile and collapse button */}
        <div className="mb-4 px-2">
          {isCollapsed && !isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                <SignedIn>
           <UserButton />
       
         </SignedIn>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Your Profile</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              <SignedIn>
                  <UserButton />
              </SignedIn>
             
            </div>
          )}

          {/* Collapse button - only show on desktop */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mt-4 mx-auto flex"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )

  return (
    <div className="flex flex-col md:flex-row  w-full h-[100vh]">
      {/* Mobile header with menu button */}
      <header className="h-18 border-b border-gray-200 dark:border-gray-800 flex items-center  md:hidden ">
        {/* <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button> */}
         <div className="flex justify-center items-center ml-4 ">
         <Image
                src="https://assets.aceternity.com/logo-dark.png"
                alt="logo"
                width={30}
                height={30}
              
              />
        <div className=" font-semibold">Aria</div>
         </div>
      </header>

      {/* Mobile sidebar overlay */}
      {isMobile && isMobileOpen && (
        <div className="fixed inset-0 bg-white/50 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar - desktop: side-docked, mobile: slide-in drawer */}
      <aside
        className={cn(
          "bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-50",
          // Mobile styles
          isMobile
            ? "fixed inset-y-0 left-0 w-[280px] transform" + (isMobileOpen ? " translate-x-0" : " -translate-x-full")
            : // Desktop styles
              "relative hidden md:flex flex-col justify-between h-full",
          isCollapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
    
          <LanguageProvider>
            <div className="w-full " >
                {children}
            </div>
          </LanguageProvider>
      
    </div>
  )
}
