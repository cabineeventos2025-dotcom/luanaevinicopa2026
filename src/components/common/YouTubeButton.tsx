import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const YOUTUBE_URL = "https://www.youtube.com/@Luanaqueirozefamilia";

interface YouTubeButtonProps {
  className?: string;
  variant?: "full" | "compact" | "pill";
  label?: string;
}

export function YouTubeButton({
  className,
  variant = "full",
  label = "Ver canal no YouTube",
}: YouTubeButtonProps) {
  if (variant === "pill") {
    return (
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition-colors",
          className,
        )}
        id="youtube-pill-btn"
      >
        <Play className="h-3 w-3 fill-white" />
        YouTube
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 transition-all hover:scale-105 shadow-md",
          className,
        )}
        id="youtube-compact-btn"
      >
        <Play className="h-4 w-4 fill-white" />
        {label}
      </a>
    );
  }

  return (
    <a
      href={YOUTUBE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-base font-bold text-white hover:from-red-600 hover:to-red-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl",
        className,
      )}
      id="youtube-full-btn"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        <Play className="h-4 w-4 fill-white" />
      </div>
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        <div className="text-xs text-red-100">@Luanaqueirozefamilia</div>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0" />
    </a>
  );
}
