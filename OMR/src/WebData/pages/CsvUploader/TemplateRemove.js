import React from "react";

const TemplateRemove = ({
  removeModal,
  onTemplateRemoveHandler,
  setRemoveModal,
  removeId,
}) => {
  return (
    <>
      {removeModal && (
        <>
          {/* BACKDROP */}
          <div className="modal-backdrop fade show"></div>

          {/* MODAL */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0">

                {/* HEADER */}
                <div className="modal-header border-0">
                  <h5 className="modal-title text-danger">
                    Confirm Removal
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setRemoveModal(false)}
                  ></button>
                </div>

                {/* BODY */}
                <div className="modal-body text-center">

                  <div className="mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-25 rounded-circle"
                      style={{ width: "50px", height: "50px" }}
                    >
                      🗑️
                    </div>
                  </div>

                  <p className="text-muted mb-0">
                    Are you sure you want to remove this template?
                  </p>

                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0 d-flex justify-content-center gap-2">

                  <button
                    type="button"
                    className="btn btn-danger px-4"
                    onClick={() => onTemplateRemoveHandler(removeId)}
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setRemoveModal(false)}
                  >
                    Cancel
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

export default TemplateRemove;