import React from "react";

const DuplicateImage = ({ currentImageIndex, currentRowData, imageUrl }) => {
  return (
    <div className="container-fluid">
      
      {/* OPTIONAL HEADER */}
      <div className="text-center mb-2">
        {/* Uncomment if needed */}
        {/* 
        <h6 className="fw-semibold text-secondary">
          {currentImageIndex + 1} / {currentRowData?.imagePaths.length}
        </h6> 
        */}
      </div>

      {/* IMAGE CARD */}
      <div className="card shadow-sm border-0 rounded-4">
        <div
          className="card-body d-flex justify-content-center align-items-center p-2"
          style={{
            minHeight: "500px",
            maxHeight: "75vh",
            overflow: "auto",
          }}
        >
          {imageUrl ? (
            <img
              src={`${window.SERVER_IP}/images/${imageUrl}`}
              alt="Selected"
              className="img-fluid"
              style={{
                objectFit: "contain",
                maxHeight: "70vh",
              }}
              draggable={false}
            />
          ) : (
            <div className="text-center text-muted">
              <p className="mb-0">No Image Selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuplicateImage;