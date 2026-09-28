import React from "react";

const ModalWithLoadingBar = ({ isOpen, onClose, progress, message }) => {
  return (
    <>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <div className="modal-backdrop fade show"></div>

          {/* MODAL */}
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content border-0 shadow-lg rounded-4">

                {/* HEADER */}
                <div className="modal-header border-0 pb-0 justify-content-center">
                  <h5 className="modal-title fw-semibold text-center">
                    {progress !== 100 ? "Uploading Files" : "Processing"}
                  </h5>
                </div>

                {/* BODY */}
                <div className="modal-body text-center pt-2 pb-4 px-4">

                  {/* MESSAGE */}
                  <p className="text-muted small mb-3">
                    {progress !== 100
                      ? "Please wait while your files are being uploaded..."
                      : message}
                  </p>

                  {/* PROGRESS */}
                  <div className="progress rounded-pill" style={{ height: "18px" }}>
                    <div
                      className={`progress-bar ${
                        progress < 100
                          ? "progress-bar-striped progress-bar-animated"
                          : ""
                      }`}
                      role="progressbar"
                      style={{
                        width: `${progress}%`,
                        transition: "width 0.4s ease",
                      }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <span className="small fw-semibold">
                        {progress < 100 ? `${progress}%` : "Processing..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ModalWithLoadingBar;