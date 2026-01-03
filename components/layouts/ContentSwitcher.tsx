"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/components/ui/Hero";
import Skills from "@/components/ui/Skills";
import Projects from "@/components/ui/Projects";

export default function ContentSwitcher() {
    const [activeSection, setActiveSection] = useState("home");

    // Listen for hash changes to update state
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "") || "home";
            setActiveSection(hash);
        };

        // Set initial state
        handleHashChange();

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const renderSection = () => {
        switch (activeSection) {
            case "skills":
                return <Skills key="skills" />;
            case "projects":
                return <Projects key="projects" />;
            case "home":
            default:
                return <Hero key="hero" />;
        }
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center overflow-hidden relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full h-full flex items-center justify-center p-4"
                >
                    {renderSection()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
