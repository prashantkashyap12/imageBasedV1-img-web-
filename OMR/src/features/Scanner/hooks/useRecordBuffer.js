
import { useState, useCallback, useRef } from "react";
import { MAX_VISIBLE } from "../utils/scanUtils";
import { scannedData } from "helper/Booklet32Page_helper";

const PageSize = 1000; 

export function useRecordBuffer() {
  const [viewMode, setViewMode] = useState("live");
  const [historyData, setHistoryData] = useState([]);
  const [processedData, setProcessedData] = useState([]); 
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0); // <-- NEW: Tracks live count
        
  const templateId = localStorage.getItem("templateId");


  const lsTimerRef = useRef(null);
  const writeLastSerial = useCallback((serialNo) => {
    clearTimeout(lsTimerRef.current);
    lsTimerRef.current = setTimeout(() => {
      localStorage.setItem("lastSerialNo", JSON.stringify(serialNo ?? 0));
    }, 1000);
  }, []);

  const pushNewRecords = useCallback((newRecords = []) => {
    if (!newRecords?.length) return;
    
    setProcessedData((prev) => {
      const updated = [...prev, ...newRecords];
      
      // Calculate total records from the latest Serial No!
      const highestSerial = updated[updated.length - 1]?.["Serial No"];
      if (highestSerial) {
        setTotalRecords(Number(highestSerial));
      }

      if (updated.length > MAX_VISIBLE) {
        const extraCount = updated.length - MAX_VISIBLE;
        const latestRows = updated.slice(extraCount);
        writeLastSerial(latestRows[latestRows.length - 1]?.["Serial No"]);
        return latestRows;
      }
      
      writeLastSerial(updated[updated.length - 1]?.["Serial No"]);
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeLastSerial]);

  // dynamically calculate total pages (e.g., 2500 records / 1000 = 3 pages)
  const totalPages = Math.ceil(totalRecords / PageSize) || 1;

  const fetchHistoryPage = async ({ currentPage, folderName}) => {
    setViewMode("history");
    setIsLoadingOlder(true);
    setCurrentPage(currentPage); 
    
    try {
      // Fetch data without needing the backend to tell us the page count
      const {data} = await scannedData(folderName, currentPage, PageSize, templateId);
      setHistoryData(Array.isArray(data.record) ? data.record : []);
      // console.log(`Fetching history page`, data?.record);
    } catch (err) {
      console.error("[API load error]", err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // console.log(historyData, "historyData");  

  const clearRecords = useCallback(() => {
    clearTimeout(lsTimerRef.current);
    setProcessedData([]);
    setHistoryData([]);
    setViewMode("live");
    setCurrentPage(1);
    setTotalRecords(0); // Reset count
    localStorage.removeItem("lastSerialNo");
  }, []);

  return {
    processedData,
    historyData,
    viewMode,
    setViewMode,
    fetchHistoryPage,
    pushNewRecords,
    clearRecords,
    isLoadingOlder,
    currentPage, 
    totalPages, // <-- Exported dynamic calculation
  };
}