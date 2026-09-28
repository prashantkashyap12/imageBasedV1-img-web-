import { useEffect, useRef } from "react";

const ZoomViewer = ({ currentImage, baseUrl, focusBox }) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to selected focus area
  useEffect(() => {
    if (focusBox && containerRef.current) {
      containerRef.current.scrollTo({
        left: (focusBox.x || 0) - 20,
        top: (focusBox.y || 0) - 20,
        behavior: "auto", 
      });
    }
  }, [focusBox]);

  console.log("ZoomViewer Props:", { currentImage});

  // Cleanup image on unmount
useEffect(() => {
  return () => {
    const img = imgRef.current;

    if (img) {
      img.src = "";
    }
  };
}, []);

  // Prevent rendering empty image
  if (!currentImage) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        border: "1px solid #ccc",
        overflow: "auto",
        transformOrigin: "top left",
        maxHeight: "80vh",
        maxWidth: "100%",
      }}
    >
      <img
        ref={imgRef}
        src={`http://${baseUrl}/${currentImage}?t=${Date.now()}`}
        alt="Scanned Sheet"
        loading="lazy"
        draggable={false}
        style={{
          display: "block",
          maxWidth: "100%",
          height: "auto",
          userSelect: "none",
        }}
      />
    </div>
  );
};

export default ZoomViewer;