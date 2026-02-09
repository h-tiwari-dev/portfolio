import React from 'react';
import { cn } from '@/utils/cn';

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 xl:auto-rows-[12rem] gap-3 w-full p-2 md:p-4 bg-grid scanline-moving relative',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  children,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'group/bento transition-all duration-300 overflow-hidden relative glass border border-neutral-800 hover:border-rose-900 flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className="flex space-x-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-900"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-900"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-900"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-[10px] text-slate-400 font-mono tracking-widest hidden md:block">
            0x3F2
          </div>
          <div className="text-[11px] text-white font-mono tracking-tighter uppercase font-bold">
            {title || 'SYS_PROCESS'}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto relative min-h-0">{children}</div>

      {/* Circuit-style Corner Accents */}
      <div className="absolute top-10 left-0 w-2 h-[1px] bg-rose-900 group-hover:bg-rose-700 transition-colors pointer-events-none"></div>
      <div className="absolute top-10 left-0 w-[1px] h-2 bg-rose-900 group-hover:bg-rose-700 transition-colors pointer-events-none"></div>

      <div className="absolute bottom-4 right-0 w-4 h-[1px] bg-rose-950 group-hover:bg-rose-900 transition-colors pointer-events-none"></div>
      <div className="absolute bottom-4 right-0 w-[1px] h-4 bg-rose-950 group-hover:bg-rose-900 transition-colors pointer-events-none"></div>

      <div className="absolute top-1/2 right-0 w-1 h-[20px] border-y border-l border-rose-950 translate-y-[-50%] pointer-events-none group-hover:border-rose-900 transition-colors"></div>

      {/* Inner shadow effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-neutral-800"></div>
    </div>
  );
};
