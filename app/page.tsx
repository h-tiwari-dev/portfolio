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
    <main className="h-screen w-screen bg-background p-4 md:p-6 overflow-hidden flex items-center justify-center relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 scanlines pointer-events-none"></div>

      <BentoGrid className="w-full h-full relative z-10">
        {/* Identity: Top Left, 2x2 */}
        <BentoGridItem
          className="md:col-span-2 md:row-span-2 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]"
          title="S_IDENTITY.SYS"
        >
          <Hero />
        </BentoGridItem>

        {/* Lifeline: Top Right, 2x2 */}
        <BentoGridItem
          className="md:col-span-2 md:row-span-2 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]"
          title="S_LIFELINE.LOG"
        >
          <Experience />
        </BentoGridItem>

        {/* Simulation: Bottom Left, 2x2 */}
        <BentoGridItem
          className="md:col-span-2 md:row-span-2 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]"
          title="S_SIMULATION.IO"
        >
          <GameOfLife />
        </BentoGridItem>

        {/* Kernel Stack: Bottom Middle-Left, 1x1 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1 shadow-[0_0_30px_-12px_rgba(245,158,11,0.1)]"
          title="S_KERNEL.STACK"
        >
          <Skills />
        </BentoGridItem>

        {/* Telemetry: Bottom Middle-Right, 1x1 */}
        <BentoGridItem
          className="md:col-span-1 md:row-span-1 shadow-[0_0_30px_-12px_rgba(6,182,212,0.1)]"
          title="S_TELEMETRY.LIVE"
        >
          <SystemMetrics />
        </BentoGridItem>

        {/* Comms Link: Bottom Right, 1x2 */}
        <BentoGridItem
          className="md:col-span-2 md:row-span-1 shadow-[0_0_30px_-12px_rgba(6,182,212,0.1)]"
          title="S_COMMS.LINK"
        >
          <Socials />
        </BentoGridItem>
      </BentoGrid>
    </main>
  );
}
