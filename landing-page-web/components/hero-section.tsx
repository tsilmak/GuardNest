import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-[216px] pb-16">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Hero Content */}
          <div className="max-w-[937px] flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-6">
              <h1 className="max-w-[748px] text-center text-[#37322f] text-5xl md:text-[80px] font-normal leading-tight md:leading-[96px] font-serif">
                Keep Your Family Safe and Connected
              </h1>
              <p className="max-w-[506px] text-center text-[#37322f]/80 text-lg font-medium leading-7">
                Monitor your children's activities and stay informed about their
                safety with our comprehensive family platform.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button variant="default">Start for free</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
