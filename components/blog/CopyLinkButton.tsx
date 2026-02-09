'use client';

import { Share2 } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url)}
      className="p-2 bg-neutral-900 border border-neutral-800 hover:border-rose-900 hover:bg-rose-950 transition-all group"
      aria-label="Copy link"
    >
      <Share2
        size={14}
        className="text-slate-400 group-hover:text-rose-400 transition-colors"
      />
    </button>
  );
}
