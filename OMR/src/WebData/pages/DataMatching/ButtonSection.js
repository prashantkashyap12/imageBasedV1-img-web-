import React from "react";

const ButtonSection = ({
  currentIndex,
  csvData,
  zoomInHandler,
  onInialImageHandler,
  zoomOutHandler,
  currentImageIndex,
  imageUrls,
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center">

      <h3 className="ms-3 fs-5 fw-semibold py-2">
        Data No : {currentIndex} out of {csvData.length - 1}
      </h3>

      <div className="d-flex justify-content-center my-2">
        <button
          onClick={zoomInHandler}
          className="btn btn-primary rounded-pill mx-2 px-4"
        >
          Zoom In
        </button>

        <button
          onClick={onInialImageHandler}
          className="btn btn-primary rounded-pill mx-2 px-4"
        >
          Initial
        </button>

        <button
          onClick={zoomOutHandler}
          className="btn btn-primary rounded-pill mx-2 px-4"
        >
          Zoom Out
        </button>
      </div>

      <h3 className="fs-5 fw-semibold py-2">
        Image : {currentImageIndex + 1} Out of {imageUrls.length}
      </h3>

    </div>
  );
};

export default ButtonSection;