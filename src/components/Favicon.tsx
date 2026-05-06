import { Globe } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface IFaviconProps {
  url: string;
  size?: number;
  className?: string;
}

const Favicon = ({ url, size = 16, className }: IFaviconProps) => {
  const [hasError, setHasError] = useState(false);

  const getHostname = (u: string) => {
    try {
      return new URL(u).hostname;
    } catch {
      return null;
    }
  };

  const hostname = getHostname(url);

  if (!hostname || hasError) {
    return (
      <Globe
        className={cn("text-muted-foreground shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

  return (
    <img
      src={faviconUrl}
      alt={hostname}
      width={size}
      height={size}
      loading="lazy"
      className={cn("shrink-0 overflow-hidden rounded-sm", className)}
      onError={() => setHasError(true)}
    />
  );
};

export default Favicon;
