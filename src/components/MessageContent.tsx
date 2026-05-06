import "@/styles/index.css";

import React, { useMemo } from "react";

import { parseContent } from "@/lib/parseContent";
import { IContent, IRef } from "@/types";

import ChatHighlightCard from "./ChatHighlightCard";
import ChatInlineChart, { IChatInlineChartProps } from "./ChatInlineChart";
import MarkdownContent from "./MarkdownContent";

export interface MessageContentProps {
  /** Raw message content string. May include <chart/>, <highlight/>, and [1] citation syntax. */
  content: string;
  /** Reference data used to enrich inline citation badges on hover. */
  refs?: IRef[];
  /** Additional CSS class for the wrapper element. */
  className?: string;
  /**
   * Optional renderer for the legacy `<chart chart-type="..."/>` portfolio chart tags.
   * If omitted, these tags are silently ignored.
   */
  renderPortfolioChart?: (chartType: string) => React.ReactNode;
}

const renderItem = (
  item: IContent,
  refs: IRef[] | undefined,
  renderPortfolioChart: MessageContentProps["renderPortfolioChart"],
): React.ReactNode => {
  if (item.type === "mdx") {
    return (
      <MarkdownContent refs={refs}>{item.content ?? ""}</MarkdownContent>
    );
  }

  if (item.type === "chart") {
    if (!renderPortfolioChart || !item.content) return null;
    return renderPortfolioChart(item.content);
  }

  if (item.type === "inline-chart") {
    const { type, x, y, labels, title } = item.data ?? {};
    if (!type || !x || !y || !labels) return null;
    return (
      <ChatInlineChart
        type={type as IChatInlineChartProps["type"]}
        x={x}
        y={y}
        labels={labels}
        title={title}
      />
    );
  }

  if (item.type === "highlight-group") {
    const items = item.items ?? [];
    if (items.length === 1) {
      const { number, label, description } = items[0];
      if (!number) return null;
      return (
        <div className="my-8">
          <ChatHighlightCard
            number={number}
            label={label ?? ""}
            description={description ?? ""}
          />
        </div>
      );
    }
    return (
      <div className="my-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <ChatHighlightCard
            key={i}
            number={item.number ?? ""}
            label={item.label ?? ""}
            description={item.description ?? ""}
          />
        ))}
      </div>
    );
  }

  return null;
};

const MessageContent = ({
  content,
  refs,
  className,
  renderPortfolioChart,
}: MessageContentProps) => {
  const contents = useMemo(() => parseContent(content), [content]);

  return (
    <div className={className}>
      {contents.map((item, i) => (
        <React.Fragment key={i}>
          {renderItem(item, refs, renderPortfolioChart)}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageContent;
