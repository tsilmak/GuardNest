"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const testimonials = [
    {
      quote:
        "GuardNest gives me complete peace of mind. I can monitor my children's online activities and get instant alerts when they need my attention. It's been a game-changer for our family safety.",
      name: "Sarah Johnson",
      company: "Mother of 3, Seattle",
      image:
        "https://this-person-does-not-exist.com/img/avatar-genc1038baa57402eb32f7c46ca0ac98438.jpg",
    },
    {
      quote:
        "The comprehensive monitoring features have helped us keep our teenagers safe online. The detailed reports and safety insights are exactly what every parent needs.",
      name: "Michael Chen",
      company: "Father of 2, Austin",
      image:
        "https://this-person-does-not-exist.com/img/avatar-gen51f4f684489ffca8a3525d2dade1d0a8.jpg",
    },
    {
      quote:
        "As a working parent, GuardNest keeps me connected to my children's safety 24/7. The emergency features and real-time monitoring give me confidence they're always protected.",
      name: "Lisa Rodriguez",
      company: "Working Mom, Miami",
      image:
        "https://this-person-does-not-exist.com/img/avatar-gen96bbece13ef778e87f8b21f1705fb05c.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleNavigationClick = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTestimonial(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };

  return (
    <div className="w-full border-b border-border flex flex-col justify-center items-center">
      {/* Testimonial Content */}
      <div className="self-stretch px-2 overflow-hidden flex justify-start items-center bg-background border border-b border-l-0 border-r-0 border-t-0">
        <div className="flex-1 py-16 md:py-17 flex flex-col md:flex-row justify-center items-end gap-6">
          <div className="self-stretch px-3 md:px-12 justify-center items-start gap-4 flex flex-col md:flex-row">
            <img
              className="w-48 h-50 md:w-48 md:h-50 rounded-lg object-cover transition-all duration-700 ease-in-out"
              style={{
                opacity: isTransitioning ? 0.6 : 1,
                transform: isTransitioning ? "scale(0.95)" : "scale(1)",
                transition:
                  "opacity 0.7s ease-in-out, transform 0.7s ease-in-out",
              }}
              src={testimonials[activeTestimonial].image || "/placeholder.svg"}
              alt={testimonials[activeTestimonial].name}
            />
            <div className="flex-1 px-6 py-6 shadow-[0px_0px_0px_0.75px_hsl(var(--border))] overflow-hidden flex flex-col justify-start items-start gap-6  pb-0 pt-0">
              <div
                className="self-stretch justify-start flex flex-col text-foreground text-2xl md:text-[32px] font-medium leading-10 md:leading-[42px] font-sans h-[200px] md:h-[210px] overflow-hidden line-clamp-5 transition-all duration-700 ease-in-out tracking-tight"
                style={{
                  filter: isTransitioning ? "blur(4px)" : "blur(0px)",
                  transition: "filter 0.7s ease-in-out",
                }}
              >
                "{testimonials[activeTestimonial].quote}"
              </div>
              <div
                className="self-stretch flex flex-col justify-start items-start gap-1 transition-all duration-700 ease-in-out"
                style={{
                  filter: isTransitioning ? "blur(4px)" : "blur(0px)",
                  transition: "filter 0.7s ease-in-out",
                }}
              >
                <div className="self-stretch justify-center flex flex-col text-foreground/90 text-lg font-medium leading-[26px] font-sans">
                  {testimonials[activeTestimonial].name}
                </div>
                <div className="self-stretch justify-center flex flex-col text-foreground/70 text-lg font-medium leading-[26px] font-sans">
                  {testimonials[activeTestimonial].company}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="pr-6 justify-start items-start gap-[14px] flex">
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                handleNavigationClick(
                  (activeTestimonial - 1 + testimonials.length) %
                    testimonials.length
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                handleNavigationClick(
                  (activeTestimonial + 1) % testimonials.length
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
