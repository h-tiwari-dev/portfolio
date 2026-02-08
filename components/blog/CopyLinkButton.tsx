'use client';

import { Share2 } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url)}
      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 hover:bg-rose-500/10 transition-all group"
      aria-label="Copy link"
    >
      <Share2
        size={16}
        className="text-slate-400 group-hover:text-rose-400 transition-colors"
      />
    </button>
  );
}
