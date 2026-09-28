import React from "react";
import { GiCrossMark } from "react-icons/gi";

const PreFilesModal = ({
  setOpenPreFile,
  openPreFile,
  files,
  onDownloadFileHandler,
}) => {
  return (
    <>
      {openPreFile && (
        <>
          {/* BACKDROP */}
          <div className="modal-backdrop fade show"></div>

          {/* MODAL */}
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">

                {/* HEADER */}
                <div className="modal-header">
                  <h5 className="modal-title">Previous Files</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setOpenPreFile(false)}
                  ></button>
                </div>

                {/* BODY */}
                <div
                  className="modal-body"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  {files?.length > 0 ? (
                    files.map((file, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                      >
                        {/* File Name */}
                        <span
                          className="text-truncate"
                          style={{ maxWidth: "70%" }}
                        >
                          {file.csvFile}
                        </span>

                        {/* Download Button */}
                        <button
                          onClick={() => onDownloadFileHandler(file)}
                          className="btn btn-primary btn-sm"
                        >
                          Download
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center">
                      No previous files found.
                    </p>
                  )}
                </div>

                {/* FOOTER */}
                <div className="modal-footer justify-content-center">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setOpenPreFile(false)}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PreFilesModal;