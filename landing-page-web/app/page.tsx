"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";

import TestimonialsSection from "../components/testimonials-section";
import FAQSection from "../components/faq-section";
import PricingSection from "../components/pricing-section";
import CTASection from "../components/cta-section";
import FooterSection from "../components/footer-section";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { BorderAccent } from "@/components/border-accent";
import Image from "next/image";

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0);
  const [progress, setProgress] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true; // Ensure component is marked as mounted

    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return;

      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current) => (current + 1) % 3);
          }
          return 0;
        }
        return prev + 2; // 2% every 100ms = 5 seconds total
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleCardClick = (index: number) => {
    setActiveCard(index);
    setProgress(0);
  };

  return (
    <div className="min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-start items-center">
      <div>
        {/* Main container with proper margins */}
        <div className="w-full mx-auto relative flex flex-col justify-start items-start min-h-screen">
          {/* Left vertical line */}
          <div className="w-[1px] left-4 sm:left-8 md:left-12 lg:left-16 xl:left-20 h-full absolute bg-border z-10"></div>

          {/* Right vertical line */}
          <div className="w-[1px] right-4 sm:right-8 md:right-12 lg:right-16 xl:right-20 h-full absolute bg-border z-10"></div>

          <div className="self-stretch pt-[9px] overflow-hidden border-b border-border flex flex-col justify-center items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 relative z-10">
            {/* Navigation */}
            <Navbar />

            {/* Hero Section */}
            <div className="pt-8 sm:pt-12 md:pt-16 lg:pt-24 pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
              <div className="w-full  flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  <div className="w-full   text-center flex justify-center flex-col text-foreground text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0">
                    Keep Your Family
                    <br />
                    Safe and Connected
                  </div>
                  <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-muted-foreground sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
                    Monitor your children's activities and stay informed about
                    their safety with our comprehensive family platform.
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 relative z-10 mt-4 sm:mt-6 md:mt-8 lg:mt-10">
                <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4">
                  <Button variant="default">Start for free</Button>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto hover:bg-foreground/10 border border-border hover:border-border/50"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      Watch 60s demo
                    </span>
                  </Button>
                </div>
              </div>

              <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
                <Image
                  width={936}
                  height={936}
                  src="/mask-group-pattern.svg"
                  alt=""
                  className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
                  style={{
                    filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
                  }}
                />
              </div>

              <div className="w-full max-w-[960px] lg:w-[960px] pt-2 sm:pt-4 pb-6 sm:pb-8 md:pb-10 px-2 sm:px-4 md:px-6 lg:px-11 flex flex-col justify-center items-center gap-2 relative z-5 my-4 sm:my-6 md:my-8 lg:my-10 mb-0 lg:pb-0">
                <div className="w-full max-w-[960px] lg:w-[960px] h-[200px] sm:h-[280px] md:h-[450px] lg:h-[695.55px] bg-card shadow-[0px_0px_0px_0.9056603908538818px_rgba(0,0,0,0.08)] overflow-hidden rounded-[6px] sm:rounded-[8px] lg:rounded-[9.06px] flex flex-col justify-start items-start">
                  {/* Dashboard Content */}
                  <div className="self-stretch flex-1 flex justify-start items-start">
                    {/* Main Content */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative w-full h-full overflow-hidden">
                        {/* Product Image 1 - Plan your schedules */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 0
                              ? "opacity-100 scale-100 blur-0"
                              : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dsadsadsa.jpg-xTHS4hGwCWp2H5bTj8np6DXZUyrxX7.jpeg"
                            alt="Schedules Dashboard - Customer Subscription Management"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Image 2 - Data to insights */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 1
                              ? "opacity-100 scale-100 blur-0"
                              : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <img
                            src="/analytics-dashboard-with-charts-graphs-and-data-vi.jpg"
                            alt="Analytics Dashboard"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Image 3 - Data visualization */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                            activeCard === 2
                              ? "opacity-100 scale-100 blur-0"
                              : "opacity-0 scale-95 blur-sm"
                          }`}
                        >
                          <img
                            src="/data-visualization-dashboard-with-interactive-char.jpg"
                            alt="Data Visualization Dashboard"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch border-t border-border border-b  flex justify-center items-start">
                <BorderAccent />

                <div className="flex-1  flex flex-col md:flex-row justify-center items-stretch gap-0">
                  {/* Feature Cards */}
                  <FeatureCard
                    title="Monitor activities"
                    description="Track your children's online activities and screen time with detailed reports and alerts."
                    isActive={activeCard === 0}
                    progress={activeCard === 0 ? progress : 0}
                    onClick={() => handleCardClick(0)}
                  />
                  <FeatureCard
                    title="Safety insights"
                    description="Get comprehensive safety reports and notifications about your family's digital well-being."
                    isActive={activeCard === 1}
                    progress={activeCard === 1 ? progress : 0}
                    onClick={() => handleCardClick(1)}
                  />
                  <FeatureCard
                    title="Stay connected"
                    description="Keep your family connected with safe communication tools and emergency features."
                    isActive={activeCard === 2}
                    progress={activeCard === 2 ? progress : 0}
                    onClick={() => handleCardClick(2)}
                  />
                </div>

                <BorderAccent />
              </div>

              {/* Social Proof Section */}
              <div className="w-full border-b border-border flex flex-col justify-center items-center">
                <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 border-b border-border flex justify-center items-center gap-6">
                  <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 ">
                    <div className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                      Trusted by families worldwide
                    </div>
                    <div className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      Join thousands of families who keep their children safe
                      <br className="hidden sm:block" />
                      with our comprehensive monitoring and safety platform.
                    </div>
                  </div>
                </div>

                {/* Logo Grid */}
                <div className="self-stretch border-border flex justify-center items-start border-t border-b-0">
                  <BorderAccent />

                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-0 border-l border-r border-border">
                    {/* Logo Grid - Responsive grid */}
                    {Array.from({ length: 8 }).map((_, index) => {
                      const isMobileFirstColumn = index % 2 === 0;
                      const isDesktopFirstColumn = index % 4 === 0;
                      const isDesktopLastColumn = index % 4 === 3;
                      const isDesktopTopRow = index < 4;
                      const isDesktopBottomRow = index >= 4;

                      return (
                        <div
                          key={index}
                          className={`
                            h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 flex justify-center items-center gap-1 xs:gap-2 sm:gap-3
                            border-b border-border
                            ${index < 6 ? "sm:border-b-[0.5px]" : "sm:border-b"}
                            ${index >= 6 ? "border-b" : ""}
                            ${isMobileFirstColumn ? "border-r-[0.5px]" : ""}
                            sm:border-r-[0.5px] sm:border-l-0
                            ${
                              isDesktopFirstColumn
                                ? "md:border-l"
                                : "md:border-l-[0.5px]"
                            }
                            ${
                              isDesktopLastColumn
                                ? "md:border-r"
                                : "md:border-r-[0.5px]"
                            }
                            ${isDesktopTopRow ? "md:border-b-[0.5px]" : ""}
                            ${
                              isDesktopBottomRow
                                ? "md:border-t-[0.5px] md:border-b"
                                : ""
                            }
                            border-border
                          `}
                        >
                          <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 relative shadow-[0px_-4px_8px_rgba(255,255,255,0.64)_inset] overflow-hidden rounded-full">
                            <img
                              src="/horizon-icon.svg"
                              alt="Horizon"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="text-center flex justify-center flex-col text-foreground text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-tight md:leading-9 font-sans">
                            GuardNest
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <BorderAccent />
                </div>
              </div>

              {/* Bento Grid Section */}
              <div className="w-full border-b border-border flex flex-col justify-center items-center">
                {/* Header Section */}
                <div className="self-stretch px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 border-b border-landing-border flex justify-center items-center gap-6">
                  <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 ">
                    <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-foreground text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                      Built for complete family safety and peace of mind
                    </div>
                    <div className="self-stretch text-center text-muted-foreground text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                      Protect your family with tools that monitor, alert
                      <br />
                      and keep you connected to your children's safety.
                    </div>
                  </div>
                </div>

                {/* Bento Grid Content */}
                <div className="self-stretch flex justify-center items-start">
                  <BorderAccent />

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-r border-border">
                    {/* Top Left - Smart. Simple. Brilliant. */}
                    <div className="border-b border-r-0 md:border-r border-border p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Smart. Simple. Safe.
                        </h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          Your family's safety data is beautifully organized so
                          you see everything clearly and stay informed.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex items-center justify-center overflow-hidden">
                        Card 01
                      </div>
                    </div>

                    {/* Top Right - Your work, in sync */}
                    <div className="border-b border-landing-border p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Your family, in sync
                        </h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          Every safety alert flows instantly to your devices and
                          keeps your family connected and protected.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden text-right items-center justify-center">
                        Card 02
                      </div>
                    </div>

                    {/* Bottom Left - Effortless integration */}
                    <div className="border-r-0 md:border-r border-landing-border p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6 bg-transparent">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Effortless protection
                        </h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          All your family's devices connect in one place and
                          work together seamlessly to keep everyone safe.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          Card 03
                        </div>
                        {/* Gradient mask for soft bottom edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F7F5F3] dark:from-[#2b2b2b] to-transparent pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Bottom Right - Numbers that speak */}
                    <div className="p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-start items-start gap-4 sm:gap-6">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight font-sans">
                          Safety that speaks
                        </h3>
                        <p className="text-muted-foreground text-sm md:text-base font-normal leading-relaxed font-sans">
                          Track your family's safety with precision and turn
                          monitoring data into confident peace of mind you can
                          trust.
                        </p>
                      </div>
                      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] rounded-lg flex overflow-hidden items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          Card 04
                        </div>
                        {/* Gradient mask for soft bottom edge */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F7F5F3] dark:from-[#2b2b2b] to-transparent pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <BorderAccent />
                </div>
              </div>

              {/* Testimonials Section */}
              <TestimonialsSection />

              {/* Pricing Section */}
              <PricingSection />

              {/* FAQ Section */}
              <FAQSection />

              {/* CTA Section */}
              <CTASection />

              {/* Footer Section */}
              <FooterSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FeatureCard component definition inline to fix import error
function FeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
}: {
  title: string;
  description: string;
  isActive: boolean;
  progress: number;
  onClick: () => void;
}) {
  return (
    <div
      className={`w-full md:flex-1 self-stretch px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5 overflow-hidden flex flex-col justify-start items-start gap-1 sm:gap-2 cursor-pointer relative border-b md:border-b-0 last:border-b-0 transition-all duration-200 ease-in-out hover:bg-card/50 select-none ${
        isActive
          ? "bg-card shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border-l-0 border-r-0 md:border border-border"
          : "border-l-0 border-r-0 md:border border-border/50 hover:border-border"
      }`}
      onClick={() => {
        onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-border">
          <div
            className="h-full bg-foreground transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="self-stretch flex justify-center flex-col text-foreground text-xs sm:text-sm md:text-sm font-semibold leading-5 sm:leading-6 md:leading-6 font-sans">
        {title}
      </div>
      <div className="self-stretch text-muted-foreground text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-normal leading-[16px] sm:leading-[18px] md:leading-[20px] lg:leading-[22px] font-sans">
        {description}
      </div>
    </div>
  );
}
