# mozyfin-message-component

React component library for rendering rich message content — markdown, inline charts, math, citations, and highlight cards.

## Features

- **Markdown** — full GFM support via `react-markdown` + `remark-gfm`
- **Math** — LaTeX rendering via KaTeX (`remark-math` + `rehype-katex`)
- **Charts** — inline ECharts visualizations
- **Citations** — hover-card citation popups via Radix UI
- **Highlight cards** — styled callout blocks
- **Zero CSS import** — styles are bundled; nothing extra to import in your app

## Installation

```bash
npm install mozyfin-message-component
```

Peer dependencies (must be installed in your project):

```bash
npm install react react-dom
```

## Usage

```tsx
import { MessageContent } from 'mozyfin-message-component';

export default function App() {
  return (
    <MessageContent content="**Hello**, world! $E = mc^2$" />
  );
}
```

If you need to override or extend the default styles, import the stylesheet separately:

```tsx
import 'mozyfin-message-component/styles';
```

## API

### `<MessageContent />`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `content` | `string` | Yes | Markdown string to render |

## Development

```bash
# Build once
npm run build

# Watch mode
npm run dev
```

Output is written to `dist/`.

## License

MIT
