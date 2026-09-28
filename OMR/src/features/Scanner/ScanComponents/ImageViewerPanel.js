import React from "react";
import { Rnd } from "react-rnd";
import ZoomViewer from "../../../components/ui/ZoomView";

const ImageViewerPanel = React.memo(function ImageViewerPanel({
  isOpen,
  currentImage,
  baseUrl,
  focusBox,
  templateData,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <Rnd
      default={{
        width:  600,
        height: 700,
        x: window.innerWidth  / 2 - 450,
        y: window.innerHeight / 2 - 450,
      }}
      bounds="window"
      dragHandleClassName="ivp-header"
      enableResizing
      minWidth={400}
      minHeight={300}
      style={{ zIndex: 1000 }}
    >
      <div className="ivp-container">
        {/* Drag handle */}
        <div className="ivp-header">
          <h5 className="ivp-title">Image Viewer</h5>
        </div>

        {/* Close button */}
        <button className="ivp-close" onClick={onClose} aria-label="Close">
          ✖
        </button>


        <ZoomViewer
          currentImage={currentImage}
          baseUrl={baseUrl}
          focusBox={focusBox}
          templateData={templateData}
        />
      </div>

      {/* Scoped styles — unchanged */}
      <style>{`
        .ivp-container {
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,.15);
          height: 100%;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        .ivp-header {
          margin-bottom: 8px;
          cursor: move;
          user-select: none;
        }
        .ivp-title {
          margin: 0;
          font-weight: 600;
        }
        .ivp-close {
          position: absolute;
          top: 8px;
          right: 8px;
          border: none;
          background: transparent;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: .7;
          transition: opacity .2s;
        }
        .ivp-close:hover { opacity: 1; }
      `}</style>
    </Rnd>
  );
});

export default ImageViewerPanel;