import React from 'react';
import dynamic from 'next/dynamic';
import Markdoc, { type RenderableTreeNode } from '@markdoc/markdoc';

// Dynamically import MermaidDiagram to avoid SSR issues
const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), {
  ssr: false,
  loading: () => (
    <div className="my-8 p-6 bg-neutral-900 border border-neutral-800 overflow-x-auto">
      <div className="text-slate-500 font-mono text-sm">Loading diagram...</div>
    </div>
  ),
});

function Heading({
  level,
  children,
}: {
  level: number;
  children: React.ReactNode;
}) {
  const sizes: Record<number, string> = {
    1: 'text-3xl sm:text-4xl font-black mt-10 mb-4',
    2: 'text-2xl sm:text-3xl font-bold mt-8 mb-3',
    3: 'text-xl sm:text-2xl font-semibold mt-6 mb-2',
    4: 'text-lg sm:text-xl font-semibold mt-4 mb-2',
    5: 'text-base font-semibold mt-3 mb-1',
    6: 'text-sm font-semibold mt-3 mb-1',
  };
  return React.createElement(
    `h${level}`,
    { className: `${sizes[level] || ''} text-white` },
    children
  );
}

function CodeBlock({
  children,
  language,
}: {
  children: string;
  language?: string;
}) {
  // Handle mermaid diagrams
  if (language === 'mermaid') {
    return <MermaidDiagram chart={children} />;
  }

  return (
    <pre className="my-4 p-4 bg-neutral-900 border border-neutral-800 overflow-x-auto font-mono text-sm leading-relaxed">
      <code className={language ? `language-${language}` : ''}>{children}</code>
    </pre>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 bg-neutral-800 text-rose-300 font-mono text-[0.875em]">
      {children}
    </code>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="my-4 text-slate-300 leading-relaxed">{children}</p>;
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  );
}

function BlockQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-4 pl-4 border-l-2 border-rose-700 text-slate-400 italic">
      {children}
    </blockquote>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return <li className="my-1 text-slate-300">{children}</li>;
}

function UnorderedList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="my-4 pl-6 list-disc marker:text-rose-700">{children}</ul>
  );
}

function OrderedList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="my-4 pl-6 list-decimal marker:text-rose-700">
      {children}
    </ol>
  );
}

function HorizontalRule() {
  return <hr className="my-8 border-neutral-800" />;
}

function Image({ src, alt }: { src: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt || ''}
      className="my-6 border border-neutral-800 max-w-full"
    />
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto border border-neutral-800">
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-neutral-900 border-b border-neutral-800">{children}</thead>
  );
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-neutral-800">{children}</tbody>;
}

function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="transition-colors hover:bg-neutral-900">{children}</tr>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-sm font-semibold text-white tracking-wide">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-slate-300">{children}</td>;
}

const components = {
  Heading,
  CodeBlock,
  InlineCode,
  Paragraph,
  Link,
  BlockQuote,
  ListItem,
  UnorderedList,
  OrderedList,
  HorizontalRule,
  Image,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
};

const markdocConfig = {
  nodes: {
    heading: {
      render: 'Heading',
      attributes: { level: { type: String } },
    },
    paragraph: { render: 'Paragraph' },
    fence: {
      render: 'CodeBlock',
      attributes: {
        language: { type: String },
        content: { type: String },
      },
    },
    code: { render: 'InlineCode' },
    link: {
      render: 'Link',
      attributes: { href: { type: String } },
    },
    blockquote: { render: 'BlockQuote' },
    item: { render: 'ListItem' },
    list: {
      render: 'UnorderedList',
      attributes: { ordered: { type: Boolean } },
      transform(node: any, config: any) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        return new Markdoc.Tag(
          attributes.ordered ? 'OrderedList' : 'UnorderedList',
          {},
          children
        );
      },
    },
    hr: { render: 'HorizontalRule' },
    image: {
      render: 'Image',
      attributes: {
        src: { type: String },
        alt: { type: String },
      },
    },
    table: { render: 'Table' },
    thead: { render: 'TableHead' },
    tbody: { render: 'TableBody' },
    tr: { render: 'TableRow' },
    th: { render: 'TableHeader' },
    td: { render: 'TableCell' },
  },
};

export default function MarkdocRenderer({
  content,
}: {
  content: RenderableTreeNode;
}) {
  return (
    <div className="prose-custom">
      {Markdoc.renderers.react(content, React, { components })}
    </div>
  );
}

export function transformContent(content: any) {
  // Keystatic returns { node: <Markdoc AST> } from resolveLinkedFiles
  const ast =
    content?.node ?? Markdoc.parse(typeof content === 'string' ? content : '');
  return Markdoc.transform(ast, markdocConfig);
}
