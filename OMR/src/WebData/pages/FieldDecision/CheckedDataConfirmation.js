import React from "react";

const CheckedDataConfirmation = ({
  confirmModal,
  setConfirmModal,
  onChekedDataHandler,
  loading,
}) => {
  return (
    <div>
      {confirmModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">
                  Confirm Data Save
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmModal(false)}
                ></button>
              </div>

              {/* BODY */}
              <div className="modal-body">
                <p className="text-muted mb-0">
                  Please confirm your intention to save the checked data.
                </p>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">

                <button
                  onClick={() => setConfirmModal(false)}
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  onClick={onChekedDataHandler}
                  type="button"
                  className="btn btn-success d-flex align-items-center gap-2"
                  disabled={loading}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></span>
                  )}
                  {loading ? "Saving..." : "Confirm"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckedDataConfirmation;