import Hero from "@/components/ui/Hero";
import Skills from "@/components/ui/Skills";
import Projects from "@/components/ui/Projects";
import SystemMetrics from "@/components/ui/SystemMetrics";
import Socials from "@/components/ui/Socials";
import GameOfLife from "@/components/common/gameOfLife";
import Experience from "@/components/ui/Experience";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";

export default async function Home() {
  return (
    <main className="min-h-screen w-full bg-background p-4 md:p-6 relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 scanlines pointer-events-none"></div>

      <BentoGrid className="w-full relative z-10">
        {/* Identity & Simulation: Top Left, 2x3 */}
        <BentoGridItem
          className="lg:col-span-1 xl:col-span-2 xl:row-span-3 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]"
          title="S_IDENTITY.SYS // SIMULATION_ACTIVE"
        >
          <Hero />
        </BentoGridItem>

        {/* Lifeline: Top Right, 2x3 */}
        <BentoGridItem
          className="lg:col-span-1 xl:col-span-2 xl:row-span-3 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]"
          title="S_LIFELINE.LOG"
        >
          <Experience />
        </BentoGridItem>

        {/* Comms Link: Bottom Left, 2x2 */}
        <BentoGridItem
          className="lg:col-span-1 xl:col-span-2 xl:row-span-3 shadow-[0_0_30px_-12px_rgba(6,182,212,0.1)]"
          title="S_COMMS.LINK"
        >
          <Socials />
        </BentoGridItem>

        {/* Kernel Stack: Bottom Middle-Right, 1x2 */}
        <BentoGridItem
          className="lg:col-span-1 xl:col-span-1 xl:row-span-3 shadow-[0_0_30px_-12px_rgba(245,158,11,0.1)]"
          title="S_KERNEL.STACK"
        >
          <Skills />
        </BentoGridItem>

        {/* Telemetry: Bottom Right, 1x2 */}
        <BentoGridItem
          className="lg:col-span-1 xl:col-span-1 xl:row-span-3 shadow-[0_0_30px_-12px_rgba(6,182,212,0.1)]"
          title="S_TELEMETRY.LIVE"
        >
          <SystemMetrics />
        </BentoGridItem>
      </BentoGrid>
    </main>
  );
}
