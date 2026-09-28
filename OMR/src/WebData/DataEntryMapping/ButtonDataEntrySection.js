import React, { useEffect, useState } from 'react';

const ButtonDataEntrySection = ({
  data,
  zoomInHandler,
  onInialImageHandler,
  zoomOutHandler,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [imageName, setImageName] = useState('');

  useEffect(() => {
    setCurrentIndex(data.currentIndex);
    setTotalErrors(data.total_error);
    setImageName(data.imageName);
  }, [data]);

  return (
  <div className="d-flex justify-content-between align-items-center w-100 px-3" style={{ height: "64px" }}>
    
    <h3 className="ms-3 small fw-semibold text-black  mb-0">
      Data No: {currentIndex} out of {totalErrors}
    </h3>

    <div className="d-flex justify-content-center my-2">
      <button
        className="btn btn-primary mx-2 px-4"
        onClick={zoomInHandler}
      >
        Zoom In
      </button>

      <button
        className="btn btn-primary mx-2 px-4"
        onClick={onInialImageHandler}
      >
        Initial
      </button>

      <button
        className="btn btn-primary mx-2 px-4"
        onClick={zoomOutHandler}
      >
        Zoom Out
      </button>
    </div>

    <h3 className="fw-semibold small mb-0">
      Image Name : <span className="fw-light">{imageName}</span>
    </h3>

  </div>
);
};

export default ButtonDataEntrySection;
