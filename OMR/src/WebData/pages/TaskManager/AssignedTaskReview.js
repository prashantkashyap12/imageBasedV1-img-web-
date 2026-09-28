import React from "react";

const AssignedTaskReview = ({
  setShowModal,
  showModal,
  onTaskSubmitHandler,
  assignedUsers,
}) => {
  return (
  <div className="text-end mt-4">
    {/* PREVIEW BUTTON */}
    <button
      onClick={() => setShowModal(true)}
      className="btn btn-primary px-4 rounded-pill shadow-sm"
    >
      Preview
    </button>

    {/* MODAL */}
    {showModal && (
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ background: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                Task Assignment Preview
              </h5>
              <button
                className="btn-close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>

            {/* BODY */}
            <div
              className="modal-body"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {assignedUsers.length > 0 ? (
                <div className="list-group">

                  {assignedUsers.map((assignUser, i) => (
                    <div
                      key={i}
                      className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-3"
                    >
                      {/* USER NAME */}
                      <div className="fw-semibold text-dark">
                        {assignUser.userName}
                      </div>

                      {/* RANGE */}
                      <div className="d-flex gap-2">
                        <span className="badge bg-success px-3 py-2">
                          Min: {assignUser.min}
                        </span>
                        <span className="badge bg-info text-dark px-3 py-2">
                          Max: {assignUser.max}
                        </span>
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-center text-muted">
                  No assigned tasks yet.
                </p>
              )}
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={onTaskSubmitHandler}
                className="btn btn-success px-4"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default AssignedTaskReview;
