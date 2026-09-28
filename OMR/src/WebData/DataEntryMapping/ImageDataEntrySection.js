import React, { useEffect, useRef, useState } from "react";
import { GrPrevious } from "react-icons/gr";
import { MdOutlineArrowForwardIos } from "react-icons/md";

const ImageDataEntrySection = ({
  data,
  imageData,
  prevHandler,
  nextHandler,
  imageRef,
  loadingData,
  zoomLevel
}) => {
  const [imageUrl, setImageUrl] = useState("");
  // const [zoomLevel] = useState(1); // Keep it normal, no auto shrinking

  const imageContainerRef = useRef();

  useEffect(() => {
    setImageUrl(`${window.SERVER_IP}/images/${data.imageName}`);
  }, [data]);
  console.log(imageData);

  useEffect(() => {
    if (imageData && imageRef.current && imageContainerRef.current) {
      const { coordinateX, coordinateY, width, height } = imageData;

      const containerWidth = imageContainerRef.current.offsetWidth || 0;
      const containerHeight = imageContainerRef.current.offsetHeight || 0;

      // Keep zoom at 1 (normal scale)
      imageRef.current.style.transform = `scale(${zoomLevel})`;
      imageRef.current.style.transformOrigin = `0 0`;

      // Just scroll to center the selected field
      const scrollX = coordinateX - containerWidth / 2 + width / 2;
      const scrollY = coordinateY - containerHeight / 2 + height / 2;

      imageContainerRef.current.scrollTo({
        left: scrollX,
        top: scrollY,
        behavior: "smooth",
      });
    }
  }, [imageData, imageRef, zoomLevel]);

  console.log(imageData);

  return (
  <div className="d-flex gap-3 justify-content-center align-items-center">

    {/* Prev button */}
    <div
      onClick={prevHandler}
      className="text-white px-3 py-3 bg-primary rounded-pill mx-2 fs-5 cursor-pointer"
      style={{ cursor: "pointer" }}
    >
      <button className="btn p-0 text-white">
        <GrPrevious />
      </button>
    </div>

    {/* Image container */}
    <div>
      <div
        className="bg-white rounded shadow"
        ref={imageContainerRef}
        style={{
          position: "relative",
          border: "2px solid #0d6efd",
          width: "55rem",
          height: "23rem",
          overflow: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            ref={imageRef}
            alt="Selected"
            style={{
              width: "48rem",
              transformOrigin: "center center",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
            }}
            draggable={false}
          />
        ) : (
          <div
            className="d-flex justify-content-center align-items-center text-danger fw-bold"
            style={{
              width: "100%",
              height: "100%",
              fontSize: "1.5rem",
            }}
          >
            Image not found
          </div>
        )}

        {/* Highlight Box */}
        {imageData && (
          <div
            style={{
              border: "2px solid rgba(0, 123, 255, 0.8)",
              position: "absolute",
              backgroundColor: "rgba(0, 123, 255, 0.2)",
              left: `${imageData.coordinateX}px`,
              top: `${imageData.coordinateY}px`,
              width: `${imageData.width}px`,
              height: `${imageData.height}px`,
              borderRadius: "0.25rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          ></div>
        )}
      </div>
    </div>

    {/* Next button */}
    <div
      onClick={() => {
        if (loadingData) return;
        nextHandler();
      }}
      className={`text-white px-3 py-3 rounded-pill mx-2 fs-5 ${
        loadingData ? "bg-secondary" : "bg-primary"
      }`}
      style={{ cursor: loadingData ? "not-allowed" : "pointer" }}
    >
      <MdOutlineArrowForwardIos />
    </div>

  </div>
);
};

export default ImageDataEntrySection;
