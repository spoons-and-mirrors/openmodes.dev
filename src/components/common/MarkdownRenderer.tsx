import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  // Custom component for code blocks with syntax highlighting
  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    // Check if this is inline code - react-markdown should set inline prop
    // but we can also check if we're not inside a pre tag
    const isInline =
      inline !== false &&
      (inline === true ||
        !className ||
        (!className.startsWith("language-") &&
          String(children).indexOf("\n") === -1));

    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 text-xs bg-muted text-accent rounded font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="max-w-full overflow-hidden">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language || "text"}
          PreTag="pre"
          CodeTag="code"
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: "12px 0",
            padding: "12px",
            fontSize: "12px",
            lineHeight: "1.4",
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "6px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            maxWidth: "100%",
            overflow: "hidden",
          }}
          lineProps={{
            style: {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  };

  // Custom component for handling XML elements and other HTML-like tags
  const HtmlElement = ({ node, children, ...props }: any) => {
    const tagName = node.tagName?.toLowerCase() || "div";

    // Handle common XML/HTML elements with proper styling
    const elementStyles: Record<string, string> = {
      "system-reminder":
        "p-3 my-2 bg-yellow-900/20 border border-yellow-600/30 rounded text-yellow-200 text-sm",
      "antml:function_calls":
        "p-3 my-2 bg-blue-900/20 border border-blue-600/30 rounded text-blue-200 text-sm",
      "antml:invoke":
        "block p-2 my-1 bg-gray-800/50 border border-gray-600/30 rounded text-gray-300 text-xs font-mono",
      "antml:parameter":
        "block p-1 my-1 bg-gray-700/50 border border-gray-500/30 rounded text-gray-400 text-xs font-mono",
      example:
        "p-3 my-2 bg-green-900/20 border border-green-600/30 rounded text-green-200 text-sm",
      note: "p-3 my-2 bg-purple-900/20 border border-purple-600/30 rounded text-purple-200 text-sm",
      warning:
        "p-3 my-2 bg-red-900/20 border border-red-600/30 rounded text-red-200 text-sm",
      tool_calls:
        "p-3 my-2 bg-blue-900/20 border border-blue-600/30 rounded text-blue-200 text-sm",
      invoke:
        "block p-2 my-1 bg-gray-800/50 border border-gray-600/30 rounded text-gray-300 text-xs font-mono",
      parameter:
        "block p-1 my-1 bg-gray-700/50 border border-gray-500/30 rounded text-gray-400 text-xs font-mono",
    };

    const customClassName = elementStyles[tagName] || "inline";

    return React.createElement(
      "div",
      {
        className: customClassName,
        "data-xml-element": tagName,
        ...props,
      },
      tagName !== "br" && (
        <>
          <span className="text-xs font-mono text-gray-500 opacity-75">
            &lt;{tagName}&gt;
          </span>
          <div className="ml-2">{children}</div>
          <span className="text-xs font-mono text-gray-500 opacity-75">
            &lt;/{tagName}&gt;
          </span>
        </>
      ),
    );
  };

  return (
    <div className={`markdown-content ${className} max-w-full overflow-hidden`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code and pre elements - different handling for inline vs block
          code: CodeBlock,
          pre: ({ children }) => <>{children}</>,

          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-heading mt-4 mb-2 border-b border-muted pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-heading mt-3 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold text-heading mt-3 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-heading mt-2 mb-1">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-xs font-semibold text-heading mt-2 mb-1">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-medium text-heading mt-2 mb-1">
              {children}
            </h6>
          ),

          // Lists with better nested handling
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 my-2 space-y-1 text-text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 my-2 space-y-1 text-text-primary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed pl-1">{children}</li>
          ),

          // Paragraphs and text - using div to avoid nesting issues
          p: ({ children }) => (
            <div className="text-sm leading-relaxed text-text-primary my-2">
              {children}
            </div>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-accent hover:text-[#ffb347] underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-emphasis">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#ccc]">{children}</em>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent pl-4 my-3 text-[#ccc] italic">
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-muted text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-background-light text-white">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="text-text-primary">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-muted">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2">{children}</td>,

          // Horizontal rule
          hr: () => <hr className="border-muted my-4" />,

          // Handle HTML/XML elements that might be in the markdown
          // This will catch any unknown HTML elements and render them as XML
          div: HtmlElement,
          span: HtmlElement,
        }}
        // Allow HTML in markdown to support XML elements
        skipHtml={false}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
