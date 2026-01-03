"use client";
import { Universe, Cell } from "@/app/utils/gameOfLife";
import { useEffect, useRef, useState } from "react";

export default function GameOfLife() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const universeRef = useRef<Universe | null>(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });

    // Config
    const CELL_SIZE = 5;
    const ALIVE_COLOR = "#818cf8";
    const GLOW_COLOR = "rgba(129, 140, 248, 0.4)";

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationId: number;

        const init = () => {
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            canvas.width = rect.width;
            canvas.height = rect.height;

            const cols = Math.floor(canvas.width / CELL_SIZE);
            const rows = Math.floor(canvas.height / CELL_SIZE);

            universeRef.current = new Universe(cols, rows);
            setDims({ w: cols, h: rows });
        };

        const draw = () => {
            const universe = universeRef.current;
            if (!universe) return;

            // Manual clear for performance with alpha:false
            ctx.fillStyle = "#020617";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const { width, height, cells } = universe;

            ctx.fillStyle = ALIVE_COLOR;
            ctx.shadowBlur = 8;
            ctx.shadowColor = GLOW_COLOR;

            ctx.beginPath();
            for (let row = 0; row < height; row++) {
                for (let col = 0; col < width; col++) {
                    const idx = row * width + col;
                    if (cells[idx] === Cell.Alive) {
                        ctx.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
                    }
                }
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        };

        const tick = () => {
            if (universeRef.current) {
                universeRef.current.tick();
                draw();
            }
            animationId = requestAnimationFrame(tick);
        };

        // Initial setup
        init();
        tick();

        const handleResize = () => {
            init();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    const handleInteraction = (clientX: number, clientY: number) => {
        const universe = universeRef.current;
        const canvas = canvasRef.current;
        if (!universe || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);

        if (col >= 0 && col < universe.width && row >= 0 && row < universe.height) {
            const brushSize = 1;
            for (let r = -brushSize; r <= brushSize; r++) {
                for (let c = -brushSize; c <= brushSize; c++) {
                    const targetRow = (row + r + universe.height) % universe.height;
                    const targetCol = (col + c + universe.width) % universe.width;
                    universe.cells[targetRow * universe.width + targetCol] = Cell.Alive;
                }
            }
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full min-h-[150px] relative overflow-hidden bg-slate-950/20 group/sim">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                onMouseMove={(e) => handleInteraction(e.clientX, e.clientY)}
                onMouseDown={(e) => handleInteraction(e.clientX, e.clientY)}
                onTouchMove={(e) => handleInteraction(e.touches[0].clientX, e.touches[0].clientY)}
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 group-hover/sim:opacity-20 transition-opacity">
                <span className="text-[12px] font-mono uppercase tracking-[1em] text-indigo-400 font-bold">Simulation_Active</span>
            </div>
            <div className="absolute bottom-2 right-2 pointer-events-none opacity-20">
                <div className="text-[8px] font-mono text-slate-500">RES: {dims.w}x{dims.h}</div>
            </div>
        </div>
    )
}