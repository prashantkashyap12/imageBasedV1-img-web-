import { useEffect, useRef, useCallback } from "react";
import { useScan } from "context/ScanningContext";

export function useWebSocket({
  baseUrl,
  onMessage,
  onAccuracyChange,
  setScanning,
}) {
  const { scanSession } = useScan();

  const serialNumberRef = useRef(1);
  const totalCountRef = useRef(0);
  const trueCountRef = useRef(0);

  const mountedRef = useRef(true);

  // Latest callback refs
  const onMessageRef = useRef(onMessage);
  const onAccuracyChangeRef = useRef(onAccuracyChange);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onAccuracyChangeRef.current = onAccuracyChange;
  }, [onAccuracyChange]);

  // UI batching
  const messageQueueRef = useRef([]);
  const flushTimerRef = useRef(null);
  const BATCH_INTERVAL = 300;

  // Reset refs for new scan
  const resetRefs = useCallback(() => {
    serialNumberRef.current = 1;
    totalCountRef.current = 0;
    trueCountRef.current = 0;
  }, []);

  // Main WS effect
  useEffect(() => {
    if (!baseUrl) return;
    if (scanSession === 0) return;

    mountedRef.current = true;
    
    // Reset counters whenever a new scan session begins
    resetRefs();

    const token = localStorage.getItem("token");
    const ws = new WebSocket(`ws://${baseUrl}/ws?token=${token}`);

    // Connected
    ws.onopen = () => {
      console.log("[WS] connected");
    };

    // Incoming WS message
    ws.onmessage = async (event) => {
      if (event.data === "success") return;

      let data;

      try {
        data = JSON.parse(event.data);
      } catch {
        console.error("[WS] non-JSON message:", event.data);
        return;
      }

      if (!data) return;

      // Increment total count for every received record
      totalCountRef.current++;

      // Accuracy counters
      if (data.Status === true || data.Status === "True") {
        trueCountRef.current++;
      }

      // Row enrichment
      const row = { ...data };

      if (!row["Serial No"]) {
        row["Serial No"] = serialNumberRef.current++;
      }

      messageQueueRef.current.push(row);

      if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(() => {
          const batch = [...messageQueueRef.current];
          messageQueueRef.current.length = 0;
          flushTimerRef.current = null;
          if (!mountedRef.current) return;

          // Accuracy update
          if (totalCountRef.current > 0) {
            const accuracy = Number(
              ((trueCountRef.current / totalCountRef.current) * 100).toFixed(2),
            );

            onAccuracyChangeRef.current(accuracy);
          }

          // Push batch to UI
          if (batch.length) {
            onMessageRef.current(batch);
          }
        }, BATCH_INTERVAL);
      }
    };

    // WS error
    ws.onerror = (err) => {
      console.error("[WS] error:", err);
    };

    // WS close
    ws.onclose = async () => {
      setScanning(false);
      console.log("[WS] closed");
    };

    // Cleanup
    return () => {
      mountedRef.current = false;
      clearTimeout(flushTimerRef.current);
      ws.close();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, scanSession]);

  return { resetRefs };
}