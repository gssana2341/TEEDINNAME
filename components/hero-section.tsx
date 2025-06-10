"use client";

import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginDrawer } from "@/components/login-drawer";
import { PropertyListingModal } from "@/components/property-listing-modal";
import { TermsModal } from "@/components/terms-modal";
import { AgentRegisterModal } from "@/components/agent-register-modal";
import { useAuth } from "@/contexts/auth-context";

interface HeroSectionProps {
  activeFilter: string | null;
  onFilterChangeAction: (filter: string | null) => void;
}

export function HeroSection({ activeFilter, onFilterChangeAction }: HeroSectionProps) {
  const router = useRouter();
  const { isLoggedIn, userRole } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false)
  const [isAgentRegisterOpen, setIsAgentRegisterOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Handle scroll to show/hide sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100) // Show sticky nav after scrolling 100px
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle listing click - require login or navigate to add-property
  const handleListingClick = () => {
    if (isLoggedIn) {
      router.push('/add-property');
    } else {
      setIsLoginOpen(true);
    }
  }
  return (
    <div className="relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/hero-background.jpg" alt="Bangkok skyline" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-teal-900/60"></div>
      </div>

      {/* Floating Navigation Bar - Shows when scrolled */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isScrolled ? 'translate-y-0' : '-translate-y-full'
      } bg-gradient-to-r from-blue-900/95 to-teal-900/90 backdrop-blur-sm shadow-lg`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-white font-bold text-lg">
              TEEDIN EASY
            </Link>            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/buy" className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors">
                ซื้อ
              </Link>
              <Link href="/rent" className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors">
                เช่า
              </Link>
              <Link href="/sell" className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors">
                ขาย
              </Link>
              <Link href="/real-estate" className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors">
                อสังหาริมทรัพย์
              </Link>
              <Link href="/new-real-estate" className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors">
                อสังหาใหม่
              </Link>
              <Link href="/new-projects" className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors">
                โครงการใหม่
              </Link>              <button 
                type="button"
                onClick={handleListingClick} 
                className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors"
              >
                ลงประกาศ
              </button>              {isLoggedIn && userRole !== 'agent' && (
                <button 
                  type="button"
                  onClick={() => setIsAgentRegisterOpen(true)} 
                  className="text-white hover:text-blue-200 text-sm px-2 py-1 rounded transition-colors"
                >
                  Agent
                </button>
              )}
            </nav>
          </div>          <div className="flex items-center space-x-3">            {isLoggedIn && (
              <button 
                type="button"
                aria-label="Notifications"
                className="text-white hover:text-blue-200 transition-colors"
              >
                <Bell size={18} />
              </button>
            )}
              <div className="relative">
              <button 
                type="button"
                aria-label="Language selector"
                className="flex items-center text-white bg-transparent border border-white/30 rounded-md px-2 py-1 text-sm"
              >
                <span className="mr-1">ภาษาไทย</span>
                <ChevronDown size={14} />
              </button>
            </div>
            
            {isLoggedIn ? (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                onClick={() => {
                  window.location.href = "/dashboard"
                }}
              >
                โปรไฟล์
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                onClick={() => setIsLoginOpen(true)}
              >
                เข้าสู่ระบบ
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Original Top Navigation */}      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-white font-bold text-lg">
              TEEDIN EASY
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/buy" className="text-white hover:text-blue-200 text-sm">
                ซื้อ
              </Link>
              <Link href="/rent" className="text-white hover:text-blue-200 text-sm">
                เช่า
              </Link>
              <Link href="/sell" className="text-white hover:text-blue-200 text-sm">
                ขาย
              </Link>
              <Link href="/real-estate" className="text-white hover:text-blue-200 text-sm">
                อสังหาริมทรัพย์
              </Link>
              <Link href="/new-real-estate" className="text-white hover:text-blue-200 text-sm">
                อสังหาใหม่
              </Link>
              <Link href="/new-projects" className="text-white hover:text-blue-200 text-sm">
                โครงการใหม่
              </Link>              <button 
                type="button"
                onClick={handleListingClick} 
                className="text-white hover:text-blue-200 text-sm"
              >
                ลงประกาศ
              </button>              {isLoggedIn && userRole !== 'agent' && (
                <button 
                  type="button"
                  onClick={() => setIsAgentRegisterOpen(true)} 
                  className="text-white hover:text-blue-200 text-sm"
                >
                  Agent
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">            {isLoggedIn && (
              <button 
                type="button"
                aria-label="Notifications"
                className="text-white"
              >
                <Bell size={20} />
              </button>
            )}            <div className="relative">
              <button 
                type="button"
                aria-label="Language selector"
                className="flex items-center text-white bg-transparent border border-white/30 rounded-md px-3 py-1"
              >
                <span className="mr-1">ภาษาไทย</span>
                <ChevronDown size={16} />
              </button>
            </div>
            
            {isLoggedIn ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  window.location.href = "/dashboard"
                }}
              >
                โปรไฟล์
              </Button>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={() => setIsLoginOpen(true)}
              >
                เข้าสู่ระบบ
              </Button>
            )}
          </div>
        </div>
      </div>      {/* Search Section */}
      <div className="relative z-10 pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex mb-4 bg-white/10 backdrop-blur-sm rounded-t-lg overflow-hidden overflow-x-auto"><FilterTab label="ซื้อ" isActive={activeFilter === "buy"} onClick={() => onFilterChangeAction("buy")} />
            <FilterTab label="เช่า" isActive={activeFilter === "rent"} onClick={() => onFilterChangeAction("rent")} />
            
            {isLoggedIn && (
              <>
                <FilterTab label="ขาย" isActive={activeFilter === "sell"} onClick={() => onFilterChangeAction("sell")} />
                <FilterTab
                  label="ใกล้ BTS"
                  isActive={activeFilter === "near-bts"}
                  onClick={() => onFilterChangeAction("near-bts")}
                />
                <FilterTab
                  label="ใกล้รถไฟฟ้าสายสีแดง"
                  isActive={activeFilter === "near-red-line"}
                  onClick={() => onFilterChangeAction("near-red-line")}
                />
                <FilterTab
                  label="ใกล้มหาวิทยาลัย"
                  isActive={activeFilter === "near-university"}
                  onClick={() => onFilterChangeAction("near-university")}
                />
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex">
            <input
              type="text"
              placeholder="ค้นหาโครงการ รถไฟฟ้า เขต"
              className="flex-grow py-4 px-6 rounded-l-md focus:outline-none"
            />            <button 
              type="button"
              aria-label="Search properties"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-md flex items-center justify-center"
            >
              <Search size={24} />
            </button>
          </div>
        </div>
      </div>      {/* Login Drawer */}
      <LoginDrawer 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />{/* Property Listing Modal - Removed as we now use /add-property page */}
      {/* <PropertyListingModal isOpen={isListingModalOpen} onClose={() => setIsListingModalOpen(false)} /> */}

      {/* Agent Register Modal */}
      <AgentRegisterModal 
        isOpen={isAgentRegisterOpen}
        onClose={() => setIsAgentRegisterOpen(false)}
      />
    </div>
  );
}

interface FilterTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterTab({ label, isActive, onClick }: FilterTabProps) {
  return (
    <button
      type="button"
      className={`px-6 py-3 whitespace-nowrap ${isActive ? "bg-blue-600 text-white" : "text-white hover:bg-white/10"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}