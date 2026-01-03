"use client";

import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);
        };

        const onMouseDown = () => setIsMouseDown(true);
        const onMouseUp = () => setIsMouseDown(false);
        const onMouseLeave = () => setIsVisible(false);
        const onMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        document.documentElement.addEventListener('mouseleave', onMouseLeave);
        document.documentElement.addEventListener('mouseenter', onMouseEnter);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            document.documentElement.removeEventListener('mouseleave', onMouseLeave);
            document.documentElement.removeEventListener('mouseenter', onMouseEnter);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <>
            {/* Central Dot */}
            <div
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-indigo-500 rounded-full pointer-events-none z-[100010] transition-transform duration-75 ease-out shadow-[0_0_10px_#818cf8]"
                style={{
                    transform: `translate(${position.x - 3}px, ${position.y - 3}px)`,
                }}
            />
            {/* Outer Ring */}
            <div
                className={`fixed top-0 left-0 w-8 h-8 border border-indigo-500/30 rounded-full pointer-events-none z-[100009] transition-all duration-150 ease-out ${isMouseDown ? 'scale-75 border-green-500/50 bg-green-500/5' : 'scale-100'}`}
                style={{
                    transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
                }}
            />
            {/* Crosshair Lines */}
            <div
                className="fixed top-0 left-0 w-4 h-[1px] bg-indigo-500/20 pointer-events-none z-[100008]"
                style={{ transform: `translate(${position.x - 20}px, ${position.y}px)` }}
            />
            <div
                className="fixed top-0 left-0 w-4 h-[1px] bg-indigo-500/20 pointer-events-none z-[100008]"
                style={{ transform: `translate(${position.x + 4}px, ${position.y}px)` }}
            />
            <div
                className="fixed top-0 left-0 w-[1px] h-4 bg-indigo-500/20 pointer-events-none z-[100008]"
                style={{ transform: `translate(${position.x}px, ${position.y - 20}px)` }}
            />
            <div
                className="fixed top-0 left-0 w-[1px] h-4 bg-indigo-500/20 pointer-events-none z-[100008]"
                style={{ transform: `translate(${position.x}px, ${position.y + 4}px)` }}
            />
        </>
    );
}
