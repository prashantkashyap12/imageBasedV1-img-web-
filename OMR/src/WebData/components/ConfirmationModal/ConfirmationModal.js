
import React from "react";

const ConfirmationModal = ({
  confirmationModal,
  onSubmitHandler,
  setConfirmationModal,
  heading,
  message,
}) => {
  return (
    <>
      {confirmationModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title text-black">{heading}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmationModal(false)}
                ></button>
              </div>

              {/* BODY */}
              <div className="modal-body d-flex  align-items-center">
                <div className="">
                  <div
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#d1e7dd",
                    }}
                  >
                    ✔
                  </div>
                </div>

                <div>
                  <p className="ml-3 mt-3 text-black">{message}</p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setConfirmationModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={onSubmitHandler}
                >
                  OK
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmationModal;