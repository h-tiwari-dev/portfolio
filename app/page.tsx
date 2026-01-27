import Hero from "@/components/ui/Hero";
import Skills from "@/components/ui/Skills";
import Socials from "@/components/ui/Socials";
import Experience from "@/components/ui/Experience";
import ThreeBackground from "@/components/three/ThreeBackground";
import ScrollNav from "@/components/ui/ScrollNav";

const sections = [
  { id: "hero", label: "Identity" },
  { id: "experience", label: "Lifeline" },
  { id: "skills", label: "Stack" },
  { id: "connect", label: "Comms" },
];

export default async function Home() {
  return (
    <main className="w-full h-screen bg-background relative overflow-x-hidden overflow-y-auto scroll-smooth snap-y snap-mandatory snap-scroll-container">
      {/* Three.js Globe Background - Fixed */}
      <ThreeBackground />

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none z-[1]"></div>
      <div className="fixed inset-0 scanlines pointer-events-none z-[1]"></div>

      {/* Scroll Navigation */}
      <ScrollNav sections={sections} />

      {/* Content Sections */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="h-screen flex items-center justify-center p-4 md:p-8 snap-start">
          <div className="w-full max-w-4xl mx-auto">
            <Hero />
          </div>
        </section>

        {/* Experience Section - Custom horizontal scroll */}
        <section id="experience" className="snap-start">
          <Experience />
        </section>

        {/* Skills Section */}
        <section id="skills" className="h-screen flex items-center justify-center p-4 md:p-8 snap-start">
          <div className="w-full max-w-4xl mx-auto bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 shadow-[0_0_50px_-12px_rgba(245,158,11,0.15)]">
            <Skills />
          </div>
        </section>

        {/* Connect Section */}
        <section id="connect" className="h-screen flex items-center justify-center p-4 md:p-8 snap-start">
          <div className="w-full max-w-4xl mx-auto bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-6 shadow-[0_0_30px_-12px_rgba(6,182,212,0.15)]">
            <Socials />
          </div>
        </section>
      </div>
    </main>
  );
}
