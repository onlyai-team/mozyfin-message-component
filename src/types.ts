export interface IRef {
  type?: string;
  name?: string;
  source?: string;
  output?: unknown;
  citation_key?: string;
}

export interface IContent {
  type?: "mdx" | "chart" | "inline-chart" | "highlight-group";
  content?: string;
  data?: Record<string, string>;
  items?: Record<string, string>[];
}
