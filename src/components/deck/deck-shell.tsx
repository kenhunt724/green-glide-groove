import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Maximize, Minimize, ChevronLeft, ChevronRight } from "lucide-react";

interface DeckShellProps {
  slides: ReactNode[];
  title: string;
}

export function DeckShell({ slides, title }: DeckShellProps) {
  const navigate = useNavigate({ from: "/decks/data-center" });
  const search = useSearch({ from: "/decks/data-center" });
  const slideIndex = Math.max(
    0,
    Math.min(slides.length - 1, (search.slide ?? 1) - 1)
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const printMode = search.print === "1" || search.print === "true";

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    function fit() {
      const el = stageRef.current;
      if (!el) return;
      const scale = Math.min(el.clientWidth / 1920, el.clientHeight / 1080);
      el.style.setProperty("--slide-scale", String(scale || 1));
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [printMode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goTo(slideIndex + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goTo(slideIndex - 1);
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideIndex, slides.length]);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    document.title = `${slideIndex + 1}/${slides.length} — ${title}`;
  }, [slideIndex, slides.length, title]);

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    navigate({ search: { slide: clamped + 1 }, replace: true });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  if (printMode) {
    return (
      <div className="bg-background text-foreground">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="relative h-[1080px] w-[1920px] bg-background print-page"
          >
            {slide}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      className="relative h-screen w-screen overflow-hidden bg-black"
    >
      <div className="slide-wrapper">{slides[slideIndex]}</div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <span className="label-mono text-white/60">
            Earth Protection Society
          </span>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="pointer-events-auto inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-sm text-white backdrop-blur hover:bg-white/20"
          >
            {isFullscreen ? (
              <Minimize className="size-4" />
            ) : (
              <Maximize className="size-4" />
            )}
            {isFullscreen ? "Exit" : "Present"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`pointer-events-auto h-2 w-2 rounded-full transition-colors ${
                  i === slideIndex
                    ? "bg-energy"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="label-mono text-white/60">
              {slideIndex + 1} / {slides.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(slideIndex - 1)}
              disabled={slideIndex === 0}
              className="pointer-events-auto rounded bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 disabled:opacity-30"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(slideIndex + 1)}
              disabled={slideIndex === slides.length - 1}
              className="pointer-events-auto rounded bg-white/10 p-2 text-white backdrop-blur hover:bg-white/20 disabled:opacity-30"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
