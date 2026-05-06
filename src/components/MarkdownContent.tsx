import "katex/dist/katex.min.css";

import React, { useMemo } from "react";
import Markdown, { Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { cn } from "@/lib/utils";
import { IRef } from "@/types";

import RefBadge from "./RefBadge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

interface MarkdownContentProps {
  children: string;
  refs?: IRef[];
  className?: string;
}

const MarkdownContent = ({
  children,
  refs,
  className,
}: MarkdownContentProps) => {
  const processedContent = useMemo(() => {
    let content = children;

    // New format: <n v="value" e="explanation"/> → <n data-tooltip="explanation">value</n>
    content = content.replace(
      /<n\s+v="([^"]*)"\s+e="([^"]*)"\s*\/>/g,
      (_, value, explanation) => {
        const tooltipAttr = explanation.replace(/"/g, "&quot;");
        return `<n data-tooltip="${tooltipAttr}">${value}</n>`;
      },
    );

    // Old format (backward compat): <n>visible <e>tooltip</e></n>
    content = content.replace(
      /<n>([\s\S]*?)<e>([\s\S]*?)<\/e>([\s\S]*?)<\/n>/g,
      (_, before, tooltip, after) => {
        const tooltipAttr = tooltip.trim().replace(/"/g, "&quot;");
        const visible = (before + after).trim();
        return `<n data-tooltip="${tooltipAttr}">${visible}</n>`;
      },
    );

    if (!refs || refs.length === 0) return content;

    return content.replace(
      /\[(\d+(?:\.\d+)*)\]/g,
      (_, key) => `<ref-badge data-key="${key}"></ref-badge>`,
    );
  }, [children, refs]);

  const components = useMemo(() => {
    const customComponents: Components & {
      "ref-badge"?: React.ComponentType<{ "data-key"?: string }>;
      n?: React.ComponentType<{
        children?: React.ReactNode;
        "data-tooltip"?: string;
      }>;
      chart?: React.ComponentType;
      highlight?: React.ComponentType;
    } = {
      chart: () => null,
      highlight: () => null,
      table: ({ children }) => (
        <div className="not-prose border-border my-8 w-full overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-muted text-foreground">{children}</thead>
      ),
      th: ({ children, style }) => (
        <th
          className="border-border border-t border-r px-4 py-2.5 text-left text-sm font-semibold last:border-r-0"
          style={style}
        >
          {children}
        </th>
      ),
      td: ({ children, style }) => (
        <td
          className="border-border border-t border-r px-4 py-2 align-top text-sm last:border-r-0"
          style={style}
        >
          {children}
        </td>
      ),
      tr: ({ children }) => (
        <tr className="hover:bg-muted/40 transition-colors">{children}</tr>
      ),
      n: ({
        children,
        ...props
      }: {
        children?: React.ReactNode;
        "data-tooltip"?: string;
      }) => {
        const tooltip = (props as Record<string, string>)["data-tooltip"];
        if (!tooltip) return <span>{children}</span>;
        return (
          <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
              <span className="cursor-help underline decoration-dotted underline-offset-2">
                {children}
              </span>
            </HoverCardTrigger>
            <HoverCardContent align="start" className="w-80 p-3">
              <p className="text-sm">{tooltip}</p>
            </HoverCardContent>
          </HoverCard>
        );
      },
    };

    if (refs && refs.length > 0) {
      customComponents["ref-badge"] = (props: { "data-key"?: string }) => {
        const key = props["data-key"] || "";
        const refData = refs?.find((r) => r.citation_key === key);
        return <RefBadge citationKey={key} refData={refData} />;
      };
    }

    return customComponents;
  }, [refs]);

  return (
    <div
      className={cn(
        "prose prose-sm prose-zinc dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 !max-w-none break-words",
        className,
      )}
    >
      <Markdown
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
        components={components}
      >
        {processedContent ?? ""}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
