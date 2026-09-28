import React, { useState } from "react";
import { FaCloudDownloadAlt } from "react-icons/fa";
import axios from "axios";
import { REACT_APP_IP, SERVER_IP } from "../services/common";

const token = JSON.parse(localStorage.getItem("userData"));

const DeactivateModal = ({ isOpen, onClose, taskId }) => {
  const [errorLoading, setErrorLoading] = useState(false);
  const [correctLoading, setCorrectLoading] = useState(false);

  const ErrorCorrectedFileHandler = async () => {
    try {
      setErrorLoading(true);
      const response = await axios.get(
        `${window.SERVER_IP}/download/errorCorrectedCsv/${taskId}`,
        {
          responseType: "blob",
          headers: {
            token: token,
          },
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "error_corrected_file";

      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const fullFileName = `${fileName}_${timestamp}.csv`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fullFileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file", error);
    } finally {
      setErrorLoading(false);
    }
  };

  const CorrectedFileHandler = async () => {
    try {
      setCorrectLoading(true);
      const response = await axios.get(
        `${window.SERVER_IP}/download/correctedCsv/${taskId}`,
        {
          responseType: "blob",
          headers: {
            token: token,
          },
        }
      );

      console.log("Response Headers:", response.headers);

      const originalFilenameWithTimestamp =
        response.headers["x-original-filename"] || "corrected_file.csv";

      const filenameWithUnderscore =
        originalFilenameWithTimestamp.replace(/^[^_]*_/, "");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fullFileName = `${filenameWithUnderscore}_${timestamp}.csv`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fullFileName);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    } finally {
      setCorrectLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ zIndex: 1050 }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
      ></div>

      {/* Modal Wrapper */}
      <div className="position-fixed top-0 start-0 w-100 h-100 overflow-auto d-flex align-items-center justify-content-center p-3">
        <div className="bg-white rounded shadow w-100" style={{ maxWidth: "500px" }}>
          
          {/* Header */}
          <div className="px-3 pt-4 pb-3">
            <h3 className="h4 fw-semibold">
              Download File
            </h3>

            <div className="mt-4 px-2">
              
              {/* Error Corrected */}
              <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <h5 className="fw-semibold text-primary mb-0" style={{ width: "160px" }}>
                  Error Corrected File
                </h5>

                {errorLoading ? (
                  <button
                    className="btn btn-primary d-flex align-items-center"
                    disabled={errorLoading}
                  >
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Compiling & Downloading..
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={ErrorCorrectedFileHandler}
                  >
                    <FaCloudDownloadAlt />
                  </button>
                )}
              </div>

              {/* Corrected */}
              <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                <h5 className="fw-semibold text-primary mb-0" style={{ width: "160px" }}>
                  Corrected File
                </h5>

                {correctLoading ? (
                  <button
                    className="btn btn-primary d-flex align-items-center"
                    disabled={correctLoading}
                  >
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Compiling & Downloading..
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={CorrectedFileHandler}
                  >
                    <FaCloudDownloadAlt />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="bg-light px-3 py-2 d-flex justify-content-end">
            <button
              type="button"
              onClick={() => onClose()}
              className="btn btn-outline-secondary"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeactivateModal;