import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { scanFiles, pauseScanning, resumeScanning, resetScanApi, } from "helper/Booklet32Page_helper";
import { useScan } from "context/ScanningContext";

import {
  getImagesFromDB,
  clearImagesFromDB,
} from "../imageIndexedDB"


export function useScanControls({ onScanStart } = {}) {

  // Initialize scanning state from localStorage to avoid blink on mount
  const [scanning, setScanning] = useState(() => {
    const stored = localStorage.getItem("scan_scanning");
    return stored !== null ? stored === "true" : false;
  });

  const [isPaused, setIsPaused] = useState(false);
  const [csvString, setCsvString] = useState("");

  const { setScanSession } = useScan();

  useEffect(() => {
    localStorage.setItem("scan_scanning", String(scanning));
  }, [scanning]);

  const handleStart = useCallback(async () => {
    if (scanning) {
      return;
    }

    const folderName = localStorage.getItem(
      "folderName"
    );

    const templateId = localStorage.getItem(
      "templateId"
    );

    if (!folderName) {
      toast.error("Please select a folder");
      return;
    }

    if (!templateId) {
      toast.error("Please select a template");
      return;
    }

    // Increment scan session to allow WebSocket to connect
    setScanSession((prev) => prev + 1);

    try {
      /*
       * 1. Get images from IndexedDB
       */
      const filesToScan = await getImagesFromDB();

      if (!filesToScan.length) {
        toast.error(
          "No images available for scanning"
        );

        localStorage.removeItem(
          "imagesAreReadyInDb"
        );

        return;
      }

      console.log(
        `[useScanControls] ${filesToScan.length} images loaded from IndexedDB`
      );

      /*
       * 2. Now scanning can actually start
       */
      onScanStart?.();

      setScanning(true);
      setIsPaused(false);

      /*
       * 3. Send images to API
       */
      const result = await scanFiles(
        folderName,
        templateId,
        filesToScan
      );


      await clearImagesFromDB();

      localStorage.removeItem(
        "imagesAreReadyInDb"
      );


      const csvUrl = result?.csv;

      setCsvString(
        csvUrl || ""
      );

    } catch (err) {
      console.error(
        "[useScanControls] start error:",
        err
      );

      setScanning(false);
      setIsPaused(false);

      if (err?.name === "AbortError") {
        return;
      }

      toast.error(
        err?.response?.data ||
        err?.message ||
        "Failed to start scan"
      );
    }
  }, [
    scanning,
    onScanStart,
    setScanSession,
  ]);

  const handlePause = useCallback(async () => {
    try {
      await pauseScanning();
      setIsPaused(true);
      toast.warning("Scanning paused");
    } catch (err) {
      console.error("[useScanControls] pause error:", err);
      toast.error("Failed to pause scanning");
    }
  }, []);

  const handleResume = useCallback(async () => {
    try {
      await resumeScanning();
      setIsPaused(false);
      toast.info("Scanning resumed");
    } catch (err) {
      console.error("[useScanControls] resume error:", err);
      toast.error("Failed to resume scanning");
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await resetScanApi();
      setIsPaused(false);
      setScanning(false);
      setScanSession(0); // Disconnect websocket
      toast.info("Scan stopped and reset");
    } catch (err) {
      console.error("[useScanControls] reset error:", err);
      toast.error("Failed to reset scanning");
    }
  }, [setScanSession]);

  return {
    csvString,
    setScanning,
    scanning,
    isPaused,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
  };
}