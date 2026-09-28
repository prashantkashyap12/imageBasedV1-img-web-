import React from "react";

const TemplateEdit = ({
  onTemplateEditHandler,
  editModal,
  editId,
  setEditModal,
}) => {
  return (
    <>
      {editModal && (
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
                  <h5 className="modal-title">Confirm Update</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditModal(false)}
                  ></button>
                </div>

                {/* BODY */}
                <div className="modal-body text-center">
                  <div className="mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-25 rounded-circle"
                      style={{ width: "50px", height: "50px" }}
                    >
                      ⚠️
                    </div>
                  </div>

                  <p className="text-muted mb-0">
                    Are you sure you want to update the template?
                  </p>
                </div>

                {/* FOOTER */}
                <div className="modal-footer border-0 d-flex justify-content-center gap-2">

                  <button
                    type="button"
                    className="btn btn-danger px-4"
                    onClick={() => onTemplateEditHandler(editId)}
                  >
                    Confirm
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setEditModal(false)}
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

export default TemplateEdit;