import React from "react";
import { REACT_APP_IP } from "../../services/common";


const  ImageSectionCSV = ({
  imageUrls,
  imageContainerRef,
  currentImageIndex,
  imageRef,
  zoomLevel,
  selectedCoordintes,
  templateHeaders,
  currentData,
}) => {
  console.log(zoomLevel);

  return (
    <div
      ref={imageContainerRef}
      className="mx-auto bg-white"
      style={{
        position: "relative",
        border: "2px solid gray",
        width: "48rem",
        height: "40vh",
        overflow: "auto",
        scrollbarWidth: "thin",
      }}
    >
      <img
        src={`${window.SERVER_IP}/images/${imageUrls}`}
        alt="Selected"
        ref={imageRef}
        style={{
          width: "48rem",
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
        draggable={false}
      />

      {!selectedCoordintes &&
        templateHeaders?.templetedata?.map(
          (data, index) =>
            data.pageNo === currentImageIndex && (
              <div
                key={index}
                style={{
                  border: "3px solid #007bff",
                  position: "absolute",
                  backgroundColor: "rgba(0, 123, 255, 0.2)",
                  left: `${data.coordinateX}px`,
                  top: `${data.coordinateY}px`,
                  width: `${data.width}px`,
                  height: `${data.height}px`,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                }}
              ></div>
            )
        )}
    </div>
  );
};

export default ImageSectionCSV;
