import React from "react";

const HeaderMappedReview = ({
  onMapSubmitHandler,
  setShowModal,
  showModal,
  selectedAssociations,
  submitLoading,
}) => {
  return (
    <div className="text-center mt-4">

      {/* SAVE BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-success px-5 py-2 rounded-pill shadow-sm fw-semibold"
        style={{ fontSize: "16px" }}
      >
        Save Mapping
      </button>

      {/* MODAL */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 shadow">

              {/* HEADER */}
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-primary">
                  Mapped Data Review
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              {/* BODY */}
              <div
                className="modal-body p-3"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <div className="table-responsive">
                  <table className="table table-hover align-middle">

                    <thead className="table-light sticky-top">
                      <tr>
                        <th>CSV Header</th>
                        <th>Mapped To</th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.entries(selectedAssociations).map(
                        ([csvHeader, templateHeader], index) => {
                          const isUnmapped =
                            templateHeader === "UserFieldName";

                          return (
                            <tr
                              key={index}
                              className={
                                isUnmapped ? "table-danger" : ""
                              }
                            >
                              <td className="fw-semibold">
                                {csvHeader}
                              </td>
                              <td>
                                {templateHeader ||
                                  "Not Mapped"}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>

                  </table>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer border-0">

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitLoading}
                >
                  Cancel
                </button>

                <button
                  onClick={onMapSubmitHandler}
                  className="btn btn-primary d-flex align-items-center gap-2"
                  disabled={submitLoading}
                >
                  {submitLoading && (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></div>
                  )}
                  {submitLoading ? "Submitting..." : "Submit"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMappedReview;