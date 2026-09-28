import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
// Added Pagination imports from reactstrap
import { Container, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import axios from "axios";

import NormalHeader from "components/Headers/NormalHeader";
import RecognizationBtn from "../../components/ui/RecognizationBtn";
import RecognizationModal from "../../components/ui/RecognizationModal";

import { getLastScannedFiles } from "helper/Booklet32Page_helper";
import { getLayoutDataById } from "helper/TemplateHelper";
import getBaseUrl from "services/BackendApi";

import { useRecordBuffer } from "./hooks/useRecordBuffer";
import { useWebSocket } from "./hooks/useWebSocket";
import { useScanControls } from "./hooks/useScanControls";

import ScanGrid from "./ScanComponents/ScanGrid";
import ScanToolbar from "./ScanComponents/ScanToolbar";
import ImageViewerPanel from "./ScanComponents/ImageViewerPanel";

import { useScan } from "context/ScanningContext";
import { debounce } from "./utils/scanUtils";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const AdminScanJob = () => {
  const { setIsScanning, setIsPausedContext } = useScan();
  const location = useLocation();

  const [baseUrl, setBaseUrl] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateData, setTemplateData] = useState([]);
  const [headData, setHeadData] = useState(["Student Data"]);
  const [accuracy, setAccuracy] = useState(0);
  const [dbState, setDbState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshRequested, setRefreshRequested] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 576);
  const [gridHeight, setGridHeight] = useState("850px");

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [borderRowId, setBorderRowId] = useState(null);
  const [focusBox, setFocusBox] = useState({});
  const [showRecModal, setShowRecModal] = useState(false);

  const gridRef = useRef();
  const headDataSetRef = useRef(false);
  const templateFetchedRef = useRef(false);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { processedData, historyData, viewMode, setViewMode, fetchHistoryPage, pushNewRecords, clearRecords, currentPage, totalPages, } = useRecordBuffer({});

  const { csvString, scanning, isPaused, handleStart, handlePause, handleResume, handleReset, setScanning, writableRef, headerWrittenRef, fileClosingRef } = useScanControls({
    dbState,
    onScanStart: () => {
      setAccuracy(0);
      headDataSetRef.current = false;
      clearRecords();
      resetRefs();
    },
  });

  const { resetRefs } = useWebSocket({
    baseUrl, writableRef, headerWrittenRef, fileClosingRef, setScanning,
    onMessage: (rows) => {
      if (!headDataSetRef.current && rows?.length) {
        setHeadData(Object.keys(rows[0]));
        headDataSetRef.current = true;
      }
      pushNewRecords(rows);
    },
    onAccuracyChange: setAccuracy,
  });

  const handlehistory = async (requestedPage) => {
    const folderPath = localStorage.getItem("folderName");
    const folderName = folderPath?.split(/[\\/]/).filter(Boolean).pop();

    try {
      await fetchHistoryPage({ folderName, currentPage: requestedPage });
    } catch (error) {
      console.log(error.message);
    }
  };


  // ── Debounced Controls ───────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedStart = useCallback(debounce(handleStart, 500), [handleStart]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPause = useCallback(debounce(handlePause, 500), [handlePause]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedResume = useCallback(debounce(handleResume, 500), [handleResume, handleReset,]);

  // ── Context sync ───────────────────────────────────────────────────────────
  useEffect(() => { setIsScanning(scanning); }, [scanning, setIsScanning]);
  useEffect(() => { setIsPausedContext(isPaused); }, [isPaused, setIsPausedContext]);

  // ── Base URL ───────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const base = await getBaseUrl();
        if (base) setBaseUrl(new URL(base).host);
      } catch (e) {
        console.error("[AdminScanJob] getBaseUrl:", e);
      }
    })();
  }, []);

  // ── Initial data fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const templateId = localStorage.getItem("templateId");
        const res = await getLastScannedFiles(templateId);
        if (!res?.state) return;
        const data = res.res;
        if (!Array.isArray(data) || !data.length) return;

        setHeadData(Object.keys(data[0]));
        headDataSetRef.current = true;

        let serial = Number(localStorage.getItem("lastSerialNo") || 1);
        const mapped = data.map((d) => ({
          ...d,
          "Serial No": d["Serial No"] ?? serial++,
        }));
        pushNewRecords(mapped);
      } catch (e) {
        console.error("[AdminScanJob] initial fetch:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!baseUrl) return;
    if (templateFetchedRef.current) return;
    templateFetchedRef.current = true;

    (async () => {
      try {
        const base = await getBaseUrl();
        const templateId = localStorage.getItem("templateId");
        const res = await getLayoutDataById(templateId);
        if (!res?.data?.jsonPath) return;

        const { data } = await axios.get(`${base}${res.data.jsonPath}`);
        if (data?.fields) setTemplateData(data.fields);
      } catch (e) {
        console.error("[AdminScanJob] template fetch:", e);
      }
    })();
  }, [baseUrl]);

  // ── Responsive sizing ──────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      setIsSmallScreen(window.innerWidth < 576);
      setGridHeight(`${window.innerHeight * 0.65}px`);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setTemplateName(localStorage.getItem("templateName") || "");
  }, [location]);

  useEffect(() => {
    if (refreshRequested) {
      if (processedData.length === 0 && historyData.length === 0) {
        gridRef.current?.refresh();
        setRefreshRequested(false);
      }
    }
  }, [refreshRequested, processedData, historyData, gridRef]);

  // ── Grid callbacks ─────────────────────────────────────────────────────────
  const handleActionComplete = useCallback((args) => {
    if (!args.data) return;
  }, []);

  const handleRowSelected = useCallback((args) => {
    const row = args?.data;
    if (!row?.FileName) return;
    setBorderRowId(row.FileName);
    setCurrentImage(row.FileName);
    setIsViewerOpen(true);
  }, []);

  const handleCellSelected = useCallback(
    (args) => {
      const row = args?.data;
      const colIdx = args?.currentCell?.cellIndex;
      if (!row) return;
      const key = Object.keys(row)[colIdx];
      const field = templateData.find((f) => f.fieldName === key);
      if (field) {
        const { x, y, width, height } = field;
        setFocusBox({ x, y, width, height });
      }
      setCurrentImage(row?.FileName);
      setIsViewerOpen(true);
    },
    [templateData],
  );

  const handleGridClick = useCallback((e) => {
    if (!e.target.closest(".e-row")) {
      setBorderRowId(null);
      setIsViewerOpen(false);
    }
  }, []);

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    clearRecords();
    headDataSetRef.current = false;
    toast.info("Data cleared.");
    setIsRefreshing(false);
    setRefreshRequested(true);
  }, [clearRecords]);

  // ── Switch Grid Data Source ────────────────────────────────────────────────
  const currentGridData = viewMode === "live" ? processedData : historyData;
  const hasData = currentGridData.length > 0 && !refreshRequested;

  // pAGINATION
  const getPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <>
      <NormalHeader />

      <Container className="mt--6" fluid>
        <br />
        <div style={{ position: "absolute", top: "3%", right: "1%", display: "flex", justifyContent: "center", alignItems: "center", width: "100%", pointerEvents: scanning ? "none" : "auto", opacity: scanning ? 0.5 : 1, }}>
          <RecognizationBtn handleBtnClick={() => setShowRecModal(true)} />
        </div>

        <RecognizationModal
          show={showRecModal}
          onClose={() => setShowRecModal(false)}
        />

        <div className="control-section" style={{ position: "relative", top: "-40px" }}>
          <ScanGrid
            ref={gridRef}
            dataSource={currentGridData}
            headData={headData}
            gridHeight={gridHeight}
            borderRowId={borderRowId}
            templateData={templateData}
            onRowSelected={handleRowSelected}
            onCellSelected={handleCellSelected}
            onActionComplete={handleActionComplete}
            onDataBound={() => { }}
            onClick={handleGridClick}
          />

          <ImageViewerPanel
            isOpen={isViewerOpen}
            currentImage={currentImage}
            baseUrl={baseUrl}
            focusBox={focusBox}
            templateData={templateData}
            onClose={() => setIsViewerOpen(false)}
          />

          {/* ── Dynamic Pagination for History Mode ── */}
          {viewMode === "history" && totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination aria-label="History Pagination">

                {/* Previous Button with React Icon */}
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink onClick={() => handlehistory(currentPage - 1)}>
                    <FaChevronLeft style={{ fontSize: '0.8rem', marginBottom: '2px' }} />
                  </PaginationLink>
                </PaginationItem>

                {/* Page Numbers & Ellipses */}
                {getPaginationItems(currentPage, totalPages).map((item, index) => {
                  if (item === '...') {
                    return (
                      <PaginationItem disabled key={`ellipsis-${index}`}>
                        {/* <PaginationLink>....</PaginationLink> */}<span style={{ letterSpacing: "2px" }}>....</span>
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem active={currentPage === item} key={item}>
                      <PaginationLink onClick={() => handlehistory(item)}>
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {/* Next Button with React Icon */}
                <PaginationItem disabled={currentPage === totalPages}>
                  <PaginationLink onClick={() => handlehistory(currentPage + 1)}>
                    <FaChevronRight style={{ fontSize: '0.8rem', marginBottom: '2px' }} />
                  </PaginationLink>
                </PaginationItem>

              </Pagination>
            </div>
          )}

          <ScanToolbar
            csvString={csvString}
            scanning={scanning}
            isPaused={isPaused}
            isRefreshing={isRefreshing}
            accuracy={accuracy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            currentPage={currentPage}
            handlehistory={handlehistory}
            onStart={debouncedStart}
            onPause={debouncedPause}
            onResume={debouncedResume}
            onReset={handleReset}
            onRefresh={handleRefreshData}
            showRefresh={hasData}
          />
        </div>

      </Container>
    </>
  );
};

export default AdminScanJob;