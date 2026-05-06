import { IRef } from "@/types";
import Favicon from "./Favicon";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

interface IRefBadgeProps {
  citationKey: string;
  refData?: IRef;
}

const RefBadge = ({ citationKey, refData }: IRefBadgeProps) => {
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const isLink = refData?.source?.startsWith("http");

  if (!refData) {
    return (
      <span className="bg-muted text-muted-foreground mx-0.5 inline-flex h-5 items-center justify-center rounded px-1 text-xs font-medium">
        {citationKey}
      </span>
    );
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="bg-primary/10 text-primary hover:bg-primary/20 mx-0.5 inline-flex h-5 cursor-pointer items-center justify-center rounded px-1 text-xs font-medium transition-colors">
          {citationKey}
        </span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80 p-3">
        <div className="flex flex-col gap-2">
          <p className="line-clamp-2 text-sm font-medium">
            {refData.name || (refData.source && getHostname(refData.source))}
          </p>
          {isLink && (
            <a
              href={refData.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
            >
              <Favicon url={refData.source!} size={16} />
              <span className="truncate">{getHostname(refData.source!)}</span>
            </a>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default RefBadge;
