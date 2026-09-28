import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "react-toastify";

const WAIT_MS = 3000;

export function useGridScroll({ gridRef, onLoadOlder }) {
  // UI-only state — only used to show/hide the LoadingBanner
  const [isWaitingToLoad, setIsWaitingToLoad] = useState(false);

  const waitTimerRef   = useRef(null);
  const onLoadOlderRef = useRef(onLoadOlder);
  useEffect(() => { onLoadOlderRef.current = onLoadOlder; }, [onLoadOlder]);

  const isWaitingRef = useRef(false);

  // handleScroll has NO state dependencies → created ONCE, stable forever
  const handleScroll = useCallback(async (e) => {
    if (e?.target?.scrollTop !== 0) return;
    if (isWaitingRef.current) return;       // guard via ref, not state

    isWaitingRef.current = true;
    setIsWaitingToLoad(true);               // update UI banner via state
    toast.info("Scroll held at top – loading older records in 3 s…");

    clearTimeout(waitTimerRef.current);
    waitTimerRef.current = setTimeout(async () => {
      isWaitingRef.current = false;
      setIsWaitingToLoad(false);
      const loaded = await onLoadOlderRef.current();
      if (!loaded) toast.info("No older records stored.");
      else         toast.success("Older records loaded.");
    }, WAIT_MS);
  }, []); // ← empty deps: listener attached ONCE and never re-attached

  useEffect(() => {
    const gridEl = gridRef.current?.element?.querySelector(".e-content");
    if (!gridEl) return;
    gridEl.addEventListener("scroll", handleScroll);
    return () => {
      gridEl.removeEventListener("scroll", handleScroll);
      clearTimeout(waitTimerRef.current);
    };
  }, [gridRef, handleScroll]);

  return { isWaitingToLoad };
}