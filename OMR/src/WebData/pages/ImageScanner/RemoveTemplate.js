
import React from "react";

const RemoveTemplate = ({
  onRemoveSelectedHandler,
  removeModal,
  setRemoveModal,
}) => {
  return (
    <>
      {removeModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  Remove Template
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRemoveModal(false)}
                ></button>
              </div>

              {/* BODY */}
              <div className="modal-body d-flex align-items-center">
                <div className="me-3">
                  <div
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#f8d7da",
                    }}
                  >
                    ❌
                  </div>
                </div>

                <div>
                  <p className="mb-0 text-black pl-3">
                    Are you sure you want to remove this coordinate?
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setRemoveModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-danger"
                  onClick={onRemoveSelectedHandler}
                >
                  Remove
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RemoveTemplate;
