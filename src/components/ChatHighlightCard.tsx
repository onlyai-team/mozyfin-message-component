import { useMemo } from "react";

function formatBigNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

interface IChatHighlightCardProps {
  number: string;
  label: string;
  description: string;
}

const ChatHighlightCard = ({
  number,
  label,
  description,
}: IChatHighlightCardProps) => {
  const formatted = useMemo(() => {
    const num = parseFloat(number);
    return isNaN(num) ? number : formatBigNumber(num);
  }, [number]);

  return (
    <div className="bg-muted rounded-lg border p-3">
      <div className="text-foreground text-xl font-bold tracking-tight">
        {formatted}
      </div>
      <div className="text-foreground mt-0.5 text-xs font-medium">{label}</div>
      {description && (
        <div className="text-muted-foreground mt-1 text-xs">{description}</div>
      )}
    </div>
  );
};

export default ChatHighlightCard;
