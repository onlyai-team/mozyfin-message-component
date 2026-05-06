import { IContent } from "../types";

export const parseTagAttributes = (tag: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(tag)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
};

export const parseContent = (content: string): IContent[] => {
  const result: IContent[] = [];

  const sanitizedContent = content.replace(/<!--[\s\S]*?-->/g, "");

  const tagPattern =
    /<chart chart-type="[^"]+" \/>|<chart\s[^>]*\/>|<chart\s*\/>|<highlight\s[^>]*\/>/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(sanitizedContent)) !== null) {
    const textBefore = sanitizedContent.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      result.push({ type: "mdx", content: textBefore });
    }

    const tag = match[0];

    if (tag.startsWith("<chart chart-type=")) {
      const chartTypeMatch = tag.match(/chart-type="([^"]+)"/);
      if (chartTypeMatch) {
        result.push({ type: "chart", content: chartTypeMatch[1] });
      }
    } else if (tag.startsWith("<chart")) {
      result.push({ type: "inline-chart", data: parseTagAttributes(tag) });
    } else if (tag.startsWith("<highlight")) {
      const attrs = parseTagAttributes(tag);
      const last = result[result.length - 1];
      if (last?.type === "highlight-group") {
        last.items = [...(last.items ?? []), attrs];
      } else {
        result.push({ type: "highlight-group", items: [attrs] });
      }
    }

    lastIndex = match.index + tag.length;
  }

  const remaining = sanitizedContent.slice(lastIndex);
  if (remaining.trim()) {
    result.push({ type: "mdx", content: remaining });
  }

  return result;
};
