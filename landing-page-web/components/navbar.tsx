"use client";
import { UserRound } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { GlassElement } from "@/components/GlassElement/GlassElement";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [activeItem, setActiveItem] = useState("Home");
  const navRef = useRef<HTMLDivElement>(null);
  const [navSize, setNavSize] = useState({ width: 0, height: 0 });
  const signupRef = useRef<HTMLDivElement>(null);
  const [signupSize, setSignupSize] = useState({ width: 0, height: 0 });

  const navItems = ["Home", "Features", "Pricing", "FAQ"];

  useLayoutEffect(() => {
    const updateSize = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setNavSize({
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
        });
      }
      if (signupRef.current) {
        const rect = signupRef.current.getBoundingClientRect();
        setSignupSize({
          width: Math.ceil(rect.width),
          height: Math.ceil(rect.height),
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="flex items-center justify-center">
      {/* Main Navigation - Centered */}
      <nav className="fixed inset-x-0 top-5 z-40">
        <div className="relative mx-auto flex w-full max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
          <div
            ref={navRef}
            className="absolute left-1/2 flex -translate-x-1/2 items-center"
          >
            {/* Glass effect background */}
            <div className="relative flex items-center space-x-1 rounded-full border border-navbar-border  bg-navbar-bg px-3 py-1.5">
              <div className="absolute inset-0 -z-10 w-full h-full">
                <GlassElement
                  radius={99}
                  depth={8}
                  strength={6}
                  blur={1}
                  chromaticAberration={3}
                  scrimOpacity={0.15}
                ></GlassElement>
              </div>
              {navItems.map((item) => {
                const isActive = activeItem === item;
                return (
                  <Button
                    asChild
                    key={item}
                    data-item={item}
                    variant="ghost"
                    size="sm"
                    onClick={!isActive ? () => setActiveItem(item) : undefined}
                    aria-current={isActive ? "page" : undefined}
                    aria-disabled={isActive ? true : undefined}
                    className={`relative z-0 h-10 rounded-full px-5 text-sm font-medium transition-colors duration-200 sm:h-8 sm:px-4 ${
                      isActive
                        ? "pointer-events-none text-navbar-active-text"
                        : "cursor-pointer text-navbar-text-secondary hover:text-navbar-text-primary"
                    }`}
                  >
                    <motion.button
                      whileTap={!isActive ? { scale: 0.96 } : undefined}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-navbar-active-bg"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 50,
                          }}
                        />
                      )}
                      <span className="relative z-10">{item}</span>
                    </motion.button>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 mr-4">
            <ThemeToggle />

            <div ref={signupRef} className="relative">
              <Button asChild variant="default" size="sm">
                <Link href="/auth">
                  <UserRound /> Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
