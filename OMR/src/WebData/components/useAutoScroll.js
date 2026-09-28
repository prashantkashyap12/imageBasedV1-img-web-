import { useRef, useEffect } from "react";

export default function useAutoScroll({ containerRef, threshold = 50, speed = 5 }) {
  const scrollDirection = useRef(null);
  const rafId = useRef(null);

  const scrollStep = () => {
    const container = containerRef.current;
    if (!container || !scrollDirection.current) return;

    const top = scrollDirection.current === "up" ? -speed : speed;
    container.scrollBy({ top, behavior: "auto" }); // "auto" for frame-by-frame

    rafId.current = requestAnimationFrame(scrollStep);
  };

  const startScroll = (direction) => {
    if (scrollDirection.current === direction) return;
    scrollDirection.current = direction;
    if (!rafId.current) scrollStep();
  };

  const stopScroll = () => {
    scrollDirection.current = null;
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  useEffect(() => {
    const handleMouseUp = () => stopScroll();
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      stopScroll();
    };
  }, []);

  const updateScroll = (clientY) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    if (clientY < rect.top + threshold) {
      startScroll("up");
    } else if (clientY > rect.bottom - threshold) {
      startScroll("down");
    } else {
      stopScroll();
    }
  };

  return { updateScroll, stopScroll };
}
