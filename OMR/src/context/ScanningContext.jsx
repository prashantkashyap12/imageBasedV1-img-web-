import { createContext, useContext, useState } from "react";
import useWakeLock from "features/Scanner/hooks/useWakeLock";

// Create context
const ScanContext = createContext();

// Provider component
export const ScanProvider = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isPausedContext, setIsPausedContext] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [scanSession, setScanSession] = useState(0);

  useWakeLock(isScanning);

  return (
    <ScanContext.Provider
      value={{
        isScanning,
        setIsScanning,
        isPausedContext,
        setIsPausedContext,
        isStarting,
        setIsStarting,
        scanSession,
        setScanSession,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

// Custom hook for easier usage
export const useScan = () => useContext(ScanContext);
