"use client";
import { Universe, Cell } from "@/app/utils/gameOfLife";
import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Trash2, MousePointer2 } from "lucide-react";

export default function GameOfLife() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const universeRef = useRef<Universe | null>(null);
    const [dims, setDims] = useState({ w: 0, h: 0 });
    const [isPlaying, setIsPlaying] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const lastPos = useRef<{ col: number, row: number } | null>(null);

    // Config
    const CELL_SIZE = 5;
    const ALIVE_COLOR = "#f59e0b";
    const GLOW_COLOR = "rgba(245, 158, 11, 0.4)";

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const universe = universeRef.current;
        if (!canvas || !universe) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        // Clear the canvas to maintain transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    }, [CELL_SIZE, ALIVE_COLOR, GLOW_COLOR]);

    // Effect 1: Setup and Resize handling
    useEffect(() => {
        const init = () => {
            const container = containerRef.current;
            const canvas = canvasRef.current;
            if (!container || !canvas) return;

            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            canvas.width = rect.width;
            canvas.height = rect.height;

            const cols = Math.floor(canvas.width / CELL_SIZE);
            const rows = Math.floor(canvas.height / CELL_SIZE);

            // Only recreate universe if dimensions changed or it doesn't exist
            if (!universeRef.current || universeRef.current.width !== cols || universeRef.current.height !== rows) {
                universeRef.current = new Universe(cols, rows);
                setDims({ w: cols, h: rows });
            }
            draw();
        };

        init();
        window.addEventListener('resize', init);
        return () => window.removeEventListener('resize', init);
    }, [draw, CELL_SIZE]);

    // Effect 2: Animation Loop
    useEffect(() => {
        let animationId: number;
        const tick = () => {
            if (universeRef.current && isPlaying) {
                universeRef.current.tick();
                draw();
            }
            animationId = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(animationId);
    }, [isPlaying, draw]);

    const handleInteraction = (clientX: number, clientY: number, forceDraw = false) => {
        const universe = universeRef.current;
        const canvas = canvasRef.current;
        if (!universe || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);

        if (col >= 0 && col < universe.width && row >= 0 && row < universe.height) {
            // Prevent redundant updates
            if (lastPos.current?.col === col && lastPos.current?.row === row && !forceDraw) return;
            lastPos.current = { col, row };

            const brushSize = 1;
            for (let r = -brushSize; r <= brushSize; r++) {
                for (let c = -brushSize; c <= brushSize; c++) {
                    const targetRow = (row + r + universe.height) % universe.height;
                    const targetCol = (col + c + universe.width) % universe.width;
                    universe.cells[targetRow * universe.width + targetCol] = Cell.Alive;
                }
            }
            draw();
        }
    };

    const handleReset = () => {
        universeRef.current?.randomize();
        draw();
    };

    const handleClear = () => {
        universeRef.current?.clear();
        draw();
    };

    return (
        <div ref={containerRef} className="w-full h-full min-h-[150px] relative overflow-hidden bg-slate-950/20 group/sim">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                onMouseDown={(e) => {
                    setIsDrawing(true);
                    handleInteraction(e.clientX, e.clientY, true);
                }}
                onMouseMove={(e) => {
                    if (isDrawing) handleInteraction(e.clientX, e.clientY);
                }}
                onMouseUp={() => {
                    setIsDrawing(false);
                    lastPos.current = null;
                }}
                onMouseLeave={() => {
                    setIsDrawing(false);
                    lastPos.current = null;
                }}
                onTouchStart={(e) => {
                    setIsDrawing(true);
                    handleInteraction(e.touches[0].clientX, e.touches[0].clientY, true);
                }}
                onTouchMove={(e) => {
                    if (isDrawing) handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={() => {
                    setIsDrawing(false);
                    lastPos.current = null;
                }}
            />

            {/* Controls Overlay */}
            <div className="absolute top-6 right-6 z-50 flex items-center space-x-2 opacity-0 group-hover/sim:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-md bg-slate-900/80 border border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-400/50 transition-all"
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                    onClick={handleReset}
                    className="p-1.5 rounded-md bg-slate-900/80 border border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-400/50 transition-all"
                    title="Randomize"
                >
                    <RotateCcw size={14} />
                </button>
                <button
                    onClick={handleClear}
                    className="p-1.5 rounded-md bg-slate-900/80 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-all"
                    title="Clear"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 group-hover/sim:opacity-20 transition-opacity">
                <span className="text-[12px] font-mono uppercase tracking-[1em] text-amber-400 font-bold">
                    {isPlaying ? "Simulation_Active" : "Simulation_Paused"}
                </span>
            </div>

            <div className="absolute bottom-2 left-2 z-20 pointer-events-none opacity-0 group-hover/sim:opacity-40 transition-opacity flex items-center space-x-2">
                <MousePointer2 size={10} className="text-amber-400" />
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">Drag to Draw Patterns</span>
            </div>

            <div className="absolute bottom-2 right-2 pointer-events-none opacity-20">
                <div className="text-[8px] font-mono text-slate-500">RES: {dims.w}x{dims.h}</div>
            </div>
        </div>
    )
}