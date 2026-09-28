import { useEffect, useRef } from "react";

const useWakeLock = (isScanning) => {
  const wakeLockRef = useRef(null);

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");

        // console.log("Screen Wake Lock enabled");

        wakeLockRef.current.addEventListener("release", () => {
          // console.log("Screen Wake Lock released");
        });
      } else {
        console.log("Wake Lock API is not supported");
      }
    } catch (error) {
      console.error("Wake Lock error:", error);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;

      // console.log("Screen Wake Lock disabled");
    }
  };

  useEffect(() => {
    if (isScanning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isScanning]);

  // Re-acquire wake lock when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isScanning) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [isScanning]);
};

export default useWakeLock;