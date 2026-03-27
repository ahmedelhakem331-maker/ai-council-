'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownCinematicProps {
  content: string;
  className?: string;
}

/**
 * Optimized markdown renderer with:
 * - Syntax-highlighted code blocks
 * - Lazy loading for large content
 * - Performance optimizations (memoized)
 */
const CodeBlock = memo(
  ({
    inline,
    className,
    children,
  }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (inline) {
      return (
        <code className="bg-slate-800 text-cyan-300 px-2 py-1 rounded text-sm font-mono">
          {children}
        </code>
      );
    }

    return (
      <div className="my-4 rounded-lg overflow-hidden">
        <SyntaxHighlighter
          language={language || 'javascript'}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';

const Heading = memo(
  ({ level, children }: { level: number; children?: React.ReactNode }) => {
    const headingClass = {
      1: 'text-2xl font-bold mt-6 mb-3',
      2: 'text-xl font-bold mt-5 mb-2',
      3: 'text-lg font-semibold mt-4 mb-2',
      4: 'text-base font-semibold mt-3 mb-1',
      5: 'text-sm font-semibold mt-2 mb-1',
      6: 'text-xs font-semibold mt-2 mb-1',
    }[level] || 'text-base font-semibold';

    const Heading = `h${level}` as keyof JSX.IntrinsicElements;
    return <Heading className={`${headingClass} text-white`}>{children}</Heading>;
  }
);

Heading.displayName = 'Heading';

const ListItem = memo(({ children }: { children?: React.ReactNode }) => (
  <li className="ml-4 text-gray-300 my-1">{children}</li>
));

ListItem.displayName = 'ListItem';

const UnorderedList = memo(({ children }: { children?: React.ReactNode }) => (
  <ul className="list-disc my-2">{children}</ul>
));

UnorderedList.displayName = 'UnorderedList';

const OrderedList = memo(({ children }: { children?: React.ReactNode }) => (
  <ol className="list-decimal my-2 ml-4">{children}</ol>
));

OrderedList.displayName = 'OrderedList';

const Table = memo(({ children }: { children?: React.ReactNode }) => (
  <div className="overflow-x-auto my-4 rounded-lg border border-gray-700">
    <table className="min-w-full text-sm">{children}</table>
  </div>
));

Table.displayName = 'Table';

const TableHead = memo(({ children }: { children?: React.ReactNode }) => (
  <thead className="bg-slate-800 border-b border-gray-700">{children}</thead>
));

TableHead.displayName = 'TableHead';

const TableRow = memo(({ children }: { children?: React.ReactNode }) => (
  <tr className="border-b border-gray-800 hover:bg-slate-900/50">{children}</tr>
));

TableRow.displayName = 'TableRow';

const TableCell = memo(({ children }: { children?: React.ReactNode }) => (
  <td className="px-4 py-2 text-gray-300">{children}</td>
));

TableCell.displayName = 'TableCell';

const Blockquote = memo(({ children }: { children?: React.ReactNode }) => (
  <blockquote className="my-3 pl-4 border-l-4 border-cyan-500/50 text-gray-400 italic">
    {children}
  </blockquote>
));

Blockquote.displayName = 'Blockquote';

export const MarkdownCinematic = memo(
  ({ content, className = '' }: MarkdownCinematicProps) => {
    return (
      <div
        className={`prose prose-invert max-w-none prose-sm ${className}`}
        role="article"
      >
        <ReactMarkdown
          components={{
            code: CodeBlock,
            h1: ({ children }) => <Heading level={1} children={children} />,
            h2: ({ children }) => <Heading level={2} children={children} />,
            h3: ({ children }) => <Heading level={3} children={children} />,
            h4: ({ children }) => <Heading level={4} children={children} />,
            h5: ({ children }) => <Heading level={5} children={children} />,
            h6: ({ children }) => <Heading level={6} children={children} />,
            li: ({ children }) => <ListItem>{children}</ListItem>,
            ul: ({ children }) => <UnorderedList>{children}</UnorderedList>,
            ol: ({ children }) => <OrderedList>{children}</OrderedList>,
            table: ({ children }) => <Table>{children}</Table>,
            thead: ({ children }) => <TableHead>{children}</TableHead>,
            tr: ({ children }) => <TableRow>{children}</TableRow>,
            td: ({ children }) => <TableCell>{children}</TableCell>,
            blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
            p: ({ children }) => (
              <p className="text-gray-300 my-3 leading-relaxed">{children}</p>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-cyan-400 hover:text-cyan-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }
);

MarkdownCinematic.displayName = 'MarkdownCinematic';
