import React from "react";
import { ImZoomIn, ImZoomOut } from "react-icons/im";

const ButtonCsvSection = ({
  currentIndex,
  totalData,
  zoomInHandler,
  onInialImageHandler,
  zoomOutHandler,
  imageUrls,
}) => {
  return (
    <div className="bg-white rounded-4 px-4 d-flex flex-wrap  justify-content-between">

      {/* LEFT */}
      <div className="d-flex flex-column">
        <span className="text-muted small">Record</span>
        <span className="fw-semibold">
          {currentIndex} <span className="text-muted">/ {totalData}</span>
        </span>
      </div>

      {/* CENTER CONTROLS */}
      <div className="d-flex ml-3  align-items-center gap-2 bg-light rounded-pill px-3 py-2">

        <button
          onClick={zoomOutHandler}
          className="btn btn-sm btn-light rounded-circle shadow-sm"
          style={{ width: "36px", height: "36px" }}
        >
          <ImZoomOut />
        </button>

        <button
          onClick={onInialImageHandler}
          className="btn btn-sm btn-primary rounded-pill px-3"
        >
          Reset
        </button>

        <button
          onClick={zoomInHandler}
          className="btn btn-sm btn-light rounded-circle shadow-sm"
          style={{ width: "36px", height: "36px" }}
        >
          <ImZoomIn />
        </button>

      </div>

      {/* RIGHT */}
      <div className="d-flex flex-column text-end">
        <span className="text-muted small">Image</span>
        <span
          className="fw-medium text-dark text-truncate"
          style={{ maxWidth: "200px" }}
        >
          {imageUrls || "No Image"}
        </span>
      </div>

    </div>
  );
};

export default ButtonCsvSection;