import React from "react";
import ReactDOM from "react-dom";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

const Permissions = ({
  permissionModal,
  setPermissionModal,
  templatePermissions,
  setTemplatePermissions,
}) => {
  if (!permissionModal) return null;

  return ReactDOM.createPortal(
    <div
      className="position-fixed top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 99999, }}    >
      <div className="bg-white rounded shadow-lg p-4 w-100" style={{ maxWidth: "450px" }}      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
          <h3 className="m-0 fw-bold">Permissions</h3>
          <span onClick={() => setPermissionModal(false)} className="bg-primary text-white rounded px-2 py-1" style={{ cursor: "pointer" }}>
            <RxCross2 size={22} />
          </span>
        </div>

        {/* Form Body */}
        <div>
          {/* Pattern Definition */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Pattern Definition</label>
            <input
              type="text"
              className="form-control"
              placeholder="only: / * ~"
              value={templatePermissions?.patternDefinition || ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (
                  inputValue.length === 0 ||
                  (inputValue.length === 1 && /[/*~>-]/.test(inputValue))
                ) {
                  setTemplatePermissions((prev) => ({
                    ...prev,
                    patternDefinition: inputValue,
                  }));
                }
              }}
            />
          </div>

          {/* Blank Definition */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Blank Definition</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter blank definition..."
              value={templatePermissions?.blankDefination || ""}
              onChange={(e) =>
                setTemplatePermissions((prev) => ({
                  ...prev,
                  blankDefination: e.target.value,
                }))
              }
            />
          </div>

          {/* Field Edit Permission Checkbox */}
          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="isPermittedToEdit"
              checked={!!templatePermissions?.isPermittedToEdit}
              onChange={() =>
                setTemplatePermissions((prev) => ({
                  ...prev,
                  isPermittedToEdit: !templatePermissions?.isPermittedToEdit,
                }))
              }
            />
            <label className="form-check-label fw-semibold" htmlFor="isPermittedToEdit">
              Field Edit Permission
            </label>
          </div>

          {/* Footer Actions */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button
              type="button"
              className="btn btn-secondary btn-sm px-3"
              onClick={() => setPermissionModal(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm px-3 py-2"
              onClick={() => {
                if (!templatePermissions?.patternDefinition) {
                  toast.warning("Please enter any pattern.");
                } else {
                  setPermissionModal(false);
                }
              }}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Permissions;