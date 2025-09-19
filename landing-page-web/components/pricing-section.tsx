"use client";

import { useState } from "react";
import { BorderAccent } from "./border-accent";

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">(
    "annually"
  );

  const pricing = {
    starter: {
      monthly: 0,
      annually: 0,
    },
    professional: {
      monthly: 20,
      annually: 16, // 20% discount for annual
    },
    enterprise: {
      monthly: 200,
      annually: 160, // 20% discount for annual
    },
  };

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      {/* Header Section */}
      <div className="self-stretch px-6 md:px-28 py-12 md:py-16 border-b border-border flex justify-center items-center gap-6">
        <div className="w-full max-w-[586px] px-6 py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-4 ">
          {/* Title */}
          <div className="self-stretch text-center flex justify-center flex-col text-foreground text-3xl md:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
            Choose the perfect plan for your family
          </div>

          {/* Description */}
          <div className="self-stretch text-center text-muted-foreground text-base font-normal leading-7 font-sans">
            Protect your family with flexible pricing that grows with your
            needs.
            <br />
            Start free, upgrade when you need more features.
          </div>
        </div>
      </div>

      {/* Billing Toggle Section */}
      <div className="self-stretch px-6 md:px-16 py-9 relative flex justify-center items-center gap-4">
        {/* Toggle Container */}
        <div className="p-3 relative bg-muted/30 border border-border/20 backdrop-blur-custom backdrop-saturate-150 backdrop-brightness-110 flex justify-center items-center rounded-lg z-20 before:absolute before:inset-0 before:bg-background before:opacity-60 before:rounded-lg before:-z-10">
          <div className="p-[2px] bg-border/20 shadow-[0px_1px_0px_white] rounded-[99px] border-[0.5px] border-border/15 flex justify-center items-center gap-[2px] relative">
            <div
              className={`absolute top-[2px] w-[calc(50%-1px)] h-[calc(100%-4px)] bg-background shadow-[0px_2px_4px_rgba(0,0,0,0.08)] rounded-[99px] transition-all duration-300 ease-in-out ${
                billingPeriod === "annually" ? "left-[2px]" : "right-[2px]"
              }`}
            />

            <button
              onClick={() => setBillingPeriod("annually")}
              className="px-4 py-1 rounded-[99px] flex justify-center items-center gap-2 transition-colors duration-300 relative z-10 flex-1"
            >
              <div
                className={`text-[13px] font-medium leading-5 font-sans transition-colors duration-300 ${
                  billingPeriod === "annually"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Annually
              </div>
            </button>

            <button
              onClick={() => setBillingPeriod("monthly")}
              className="px-4 py-1 rounded-[99px] flex justify-center items-center gap-2 transition-colors duration-300 relative z-10 flex-1"
            >
              <div
                className={`text-[13px] font-medium leading-5 font-sans transition-colors duration-300 ${
                  billingPeriod === "monthly"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Monthly
              </div>
            </button>
          </div>

          {/* Decorative dots */}
          <div className="w-[3px] h-[3px] absolute left-[5px] top-[5.25px] bg-border/20 shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px]"></div>
          <div className="w-[3px] h-[3px] absolute right-[5px] top-[5.25px] bg-border/20 shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px]"></div>
          <div className="w-[3px] h-[3px] absolute left-[5px] bottom-[5.25px] bg-border/20 shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px]"></div>
          <div className="w-[3px] h-[3px] absolute right-[5px] bottom-[5.25px] bg-border/20 shadow-[0px_0px_0.5px_rgba(0,0,0,0.12)] rounded-[99px]"></div>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="self-stretch border-b border-t border-border flex justify-center items-center">
        <div className="flex justify-center items-start w-full">
          <BorderAccent />
          {/* Pricing Cards Container */}
          <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-6 py-12 md:py-0">
            {/* Starter Plan */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 border border-border overflow-hidden flex flex-col justify-start items-start gap-12 bg-card">
              {/* Plan Header */}
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-foreground/90 text-lg font-medium leading-7 font-sans">
                    Starter
                  </div>
                  <div className="w-full max-w-[242px] text-muted-foreground text-sm font-normal leading-5 font-sans">
                    Perfect for small families getting started with basic
                    monitoring.
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div className="relative h-[60px] flex items-center text-foreground text-5xl font-medium leading-[60px] font-serif">
                      <span className="invisible">
                        ${pricing.starter[billingPeriod]}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "annually" ? 1 : 0,
                          transform: `scale(${
                            billingPeriod === "annually" ? 1 : 0.8
                          })`,
                          filter: `blur(${
                            billingPeriod === "annually" ? 0 : 4
                          }px)`,
                        }}
                        aria-hidden={billingPeriod !== "annually"}
                      >
                        ${pricing.starter.annually}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "monthly" ? 1 : 0,
                          transform: `scale(${
                            billingPeriod === "monthly" ? 1 : 0.8
                          })`,
                          filter: `blur(${
                            billingPeriod === "monthly" ? 0 : 4
                          }px)`,
                        }}
                        aria-hidden={billingPeriod !== "monthly"}
                      >
                        ${pricing.starter.monthly}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm font-medium font-sans">
                      per {billingPeriod === "monthly" ? "month" : "year"}, per
                      user.
                    </div>
                  </div>
                </div>

                <div className="self-stretch px-4 py-[10px] relative bg-primary shadow-[0px_2px_4px_rgba(55,50,47,0.12)] overflow-hidden rounded-[99px] flex justify-center items-center">
                  <div className="w-full h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                  <div className="max-w-[108px] flex justify-center flex-col text-primary-foreground text-[13px] font-medium leading-5 font-sans">
                    Start for free
                  </div>
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Up to 3 child profiles",
                  "Basic activity monitoring",
                  "Community support",
                  "Standard safety alerts",
                  "Basic reports",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="self-stretch flex justify-start items-center gap-[13px]"
                  >
                    <div className="w-4 h-4 relative flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-foreground/80 text-[12.5px] font-normal leading-5 font-sans">
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Plan (Featured) */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 bg-primary border border-border overflow-hidden flex flex-col justify-start items-start gap-12">
              {/* Plan Header */}
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-primary-foreground text-lg font-medium leading-7 font-sans">
                    Professional
                  </div>
                  <div className="w-full max-w-[242px] text-primary-foreground/70 text-sm font-normal leading-5 font-sans">
                    Advanced features for growing families with comprehensive
                    monitoring.
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div className="relative h-[60px] flex items-center text-primary-foreground text-5xl font-medium leading-[60px] font-serif">
                      <span className="invisible">
                        ${pricing.professional[billingPeriod]}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "annually" ? 1 : 0,
                          transform: `scale(${
                            billingPeriod === "annually" ? 1 : 0.8
                          })`,
                          filter: `blur(${
                            billingPeriod === "annually" ? 0 : 4
                          }px)`,
                        }}
                        aria-hidden={billingPeriod !== "annually"}
                      >
                        ${pricing.professional.annually}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "monthly" ? 1 : 0,
                          transform: `scale(${
                            billingPeriod === "monthly" ? 1 : 0.8
                          })`,
                          filter: `blur(${
                            billingPeriod === "monthly" ? 0 : 4
                          }px)`,
                        }}
                        aria-hidden={billingPeriod !== "monthly"}
                      >
                        ${pricing.professional.monthly}
                      </span>
                    </div>
                    <div className="text-primary-foreground/80 text-sm font-medium font-sans">
                      per {billingPeriod === "monthly" ? "month" : "year"}, per
                      user.
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="self-stretch px-4 py-[10px] relative bg-primary-foreground shadow-[0px_2px_4px_rgba(55,50,47,0.12)] overflow-hidden rounded-[99px] flex justify-center items-center">
                  <div className="w-full h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                  <div className="max-w-[108px] flex justify-center flex-col text-primary text-[13px] font-medium leading-5 font-sans">
                    Get started
                  </div>
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Unlimited child profiles",
                  "Advanced monitoring features",
                  "Priority support",
                  "Custom safety rules",
                  "Detailed analytics",
                  "Family collaboration",
                  "Emergency features",
                  "Custom alerts",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="self-stretch flex justify-start items-center gap-[13px]"
                  >
                    <div className="w-4 h-4 relative flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="#FF8000"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-primary-foreground text-[12.5px] font-normal leading-5 font-sans">
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="flex-1 max-w-full md:max-w-none self-stretch px-6 py-5 bg-card border border-border overflow-hidden flex flex-col justify-start items-start gap-12">
              {/* Plan Header */}
              <div className="self-stretch flex flex-col justify-start items-center gap-9">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-foreground/90 text-lg font-medium leading-7 font-sans">
                    Enterprise
                  </div>
                  <div className="w-full max-w-[242px] text-muted-foreground text-sm font-normal leading-5 font-sans">
                    Complete solution for large families and extended
                    households.
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="flex flex-col justify-start items-start gap-1">
                    <div className="relative h-[60px] flex items-center text-foreground text-5xl font-medium leading-[60px] font-serif">
                      <span className="invisible">
                        ${pricing.enterprise[billingPeriod]}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "annually" ? 1 : 0,
                          transform: `scale(${
                            billingPeriod === "annually" ? 1 : 0.8
                          })`,
                          filter: `blur(${
                            billingPeriod === "annually" ? 0 : 4
                          }px)`,
                        }}
                        aria-hidden={billingPeriod !== "annually"}
                      >
                        ${pricing.enterprise.annually}
                      </span>
                      <span
                        className="absolute inset-0 flex items-center transition-all duration-500"
                        style={{
                          opacity: billingPeriod === "monthly" ? 1 : 0,
                          transform: `scale(${
                            billingPeriod === "monthly" ? 1 : 0.8
                          })`,
                          filter: `blur(${
                            billingPeriod === "monthly" ? 0 : 4
                          }px)`,
                        }}
                        aria-hidden={billingPeriod !== "monthly"}
                      >
                        ${pricing.enterprise.monthly}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-sm font-medium font-sans">
                      per {billingPeriod === "monthly" ? "month" : "year"}, per
                      user.
                    </div>
                  </div>
                </div>

                <div className="self-stretch px-4 py-[10px] relative bg-primary shadow-[0px_2px_4px_rgba(55,50,47,0.12)] overflow-hidden rounded-[99px] flex justify-center items-center">
                  <div className="w-full h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                  <div className="max-w-[108px] flex justify-center flex-col text-primary-foreground text-[13px] font-medium leading-5 font-sans">
                    Contact sales
                  </div>
                </div>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                {[
                  "Everything in Professional",
                  "Dedicated family advisor",
                  "24/7 emergency support",
                  "Custom family setup",
                  "Advanced security features",
                  "Multi-device management",
                  "Custom safety protocols",
                  "Extended family features",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="self-stretch flex justify-start items-center gap-[13px]"
                  >
                    <div className="w-4 h-4 relative flex items-center justify-center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-foreground/80 text-[12.5px] font-normal leading-5 font-sans">
                      {feature}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Decorative Pattern */}
          <BorderAccent />
        </div>
      </div>
    </div>
  );
}
