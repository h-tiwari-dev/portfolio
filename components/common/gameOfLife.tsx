"use client";
import { Cell, Universe } from "@/app/utils/gameOfLife";
import { useEffect, useRef } from "react";

export default function GameOfLife({ height, width }: { height: number, width: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const CELL_SIZE = 5;
    const GRID_COLOR = "#CCCCCC";
    const DEAD_COLOR = "#FFFFFF";
    const ALIVE_COLOR = "#000000";

    const universe = new Universe(height, width);
    const _width = universe.width;
    const _height = universe.height;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;

    useEffect(() => {
        canvas = canvasRef.current;
        if (canvas !== null) {
            canvas.height = (CELL_SIZE + 1) * _height + 1;
            canvas.width = (CELL_SIZE + 1) * _width + 1;

            ctx = canvas.getContext("2d");

            if (ctx) {
                canvas.addEventListener("click", event => {
                    if (canvas && ctx) {
                        const boundingRect = canvas.getBoundingClientRect();

                        const scaleX = canvas.width / boundingRect.width;
                        const scaleY = canvas.height / boundingRect.height;

                        const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
                        const canvasTop = (event.clientY - boundingRect.top) * scaleY;

                        const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), _height - 1);
                        const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), _width - 1);

                        universe.toggle_cell(row, col);

                        drawGrid(ctx);
                        drawCells(ctx);
                    }
                });
            }
        }
    }, [])

    setInterval(() => {
        if (canvas && ctx) {
            universe.tick();
            drawGrid(ctx);
            drawCells(ctx);
        }
    }, 10);

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;

        for (let i = 0; i <= _width; i++) {
            ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
            ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * _height + 1);
        }

        for (let j = 0; j <= _height; j++) {
            ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
            ctx.lineTo((CELL_SIZE + 1) * _width + 1, j * (CELL_SIZE + 1) + 1);
        }

        ctx.stroke();
    }

    const getIndex = (row: number, column: number) => {
        return row * _width + column;
    }

    const drawCells = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();

        for (let row = 0; row < _height; row++) {
            for (let column = 0; column < _width; column++) {
                const idx = getIndex(row, column);

                ctx.fillStyle = universe.cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

                ctx.fillRect(
                    column * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                )
            }
        }
        ctx.stroke();
    }
    return (
        <div>
            <canvas ref={canvasRef} />
        </div>
    )
}