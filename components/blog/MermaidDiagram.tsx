'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#1e1e2e',
        primaryTextColor: '#cdd6f4',
        primaryBorderColor: '#45475a',
        lineColor: '#89b4fa',
        secondaryColor: '#313244',
        tertiaryColor: '#181825',
        background: '#0c0b0a',
        mainBkg: '#1e1e2e',
        secondBkg: '#313244',
        tertiaryBkg: '#181825',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '14px',
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      securityLevel: 'loose',
    });

    if (ref.current) {
      mermaid
        .render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart)
        .then(({ svg }) => {
          setSvg(svg);
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
        });
    }
  }, [chart]);

  return (
    <div
      ref={ref}
      className="my-8 p-6 bg-neutral-900 border border-neutral-800 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
