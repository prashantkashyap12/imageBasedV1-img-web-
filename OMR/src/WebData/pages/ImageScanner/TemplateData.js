/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { toast } from "react-toastify";
import EditMappedDataModel from "./EditMappedDataModel";

const TemplateData = ({
  selectedCoordinates,
  setRemoveModal,
  setRemoveId,
  templateData,
  setTemplateData,
  setOptionModel,
  onEditCoordinateDataHanlder,
  setConfirmationModal,
  setPermissionModal,
  templatePermissions,
  setselectedtemplate,
}) => {
  // Don't show the component if there's no mapped data
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const editFlag = localStorage.getItem("editModel");
  
  if (!selectedCoordinates || selectedCoordinates.length === 0) {
    return null;
  }
  console.log("Temp Name", templateData.name);

  const onCheckHandler = () => {
    if (!templatePermissions.patternDefinition) {
      setPermissionModal(true);
      toast.warning("Please select the pattern.");
      return;
    }

    const isQuestionsField = selectedCoordinates.find(
      (coordinate) => coordinate.fieldType === "questionsField"
    );

    if (selectedCoordinates.length === 0) {
      toast.warning("Please create the coordinates.");
    } else if (templateData.name === "") {
      toast.warning("Please enter the template name.");
    } else if (!isQuestionsField) {
      setConfirmationModal(true);
    } else {
      setOptionModel(true);
    }
  };

  const handleselect = (fId) => {
    setselectedtemplate(fId);
  };

  return (
    <>
      <div className="template-sidebar-wrapper w-100 py-2">
        {/* COORDINATES LIST CARD */}
        <div className="card shadow-sm border-0 mb-3 custom-sidebar-card">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
              <h6 className="font-weight-bold text-dark mb-0 small text-uppercase tracking-wider">
                Coordinates ({selectedCoordinates?.length || 0})
              </h6>
            </div>

            {/* TABLE HEADER (FIXED: NO VERTICAL TEXT WRAPPING) */}
            <div className="d-flex justify-content-between align-items-center font-weight-bold text-muted border-bottom pb-2 mb-2 px-1 extra-small text-uppercase">
              <span className="text-nowrap">Name</span>
              <span className="text-nowrap">Actions</span>
            </div>

            {/* SCROLLABLE COORDINATES LIST */}
            <div className="template-scroll pr-1">
              {selectedCoordinates && selectedCoordinates.length > 0 ? (
                selectedCoordinates.map((data, index) => (
                  <div
                    key={data.fId}
                    className={`d-flex justify-content-between align-items-center p-2 rounded mb-1 border-bottom template-row ${
                      index % 2 === 0 ? "bg-light" : "bg-white"
                    }`}
                    onClick={() => handleselect(data.fId)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* NAME */}
                    <div
                      className="text-truncate font-weight-bold text-dark small mr-2"
                      style={{ flex: 1, minWidth: 0 }}
                      title={data.attribute}
                    >
                      {data.attribute}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="d-flex align-items-center flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-sm btn-icon-only text-primary mr-1"
                        title="Edit Coordinate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCoordinateDataHanlder(data.fId);
                        }}
                      >
                        <CiEdit className="icon-btn" />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-icon-only text-danger"
                        title="Remove Coordinate"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveModal(true);
                          setRemoveId(data);
                        }}
                      >
                        <MdDelete className="icon-btn" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-muted extra-small">
                  No coordinates added yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TEMPLATE SETTINGS CARD */}
        <div className="card shadow-sm border-0 p-3 custom-sidebar-card">
          <h6 className="font-weight-bold text-primary mb-3 small text-uppercase">
            Template Settings
          </h6>

          <div className="form-group mb-3">
            <input
              required
              type="text"
              className="form-control form-control-sm shadow-none custom-input"
              value={templateData.name}
              onChange={(e) =>
                setTemplateData({
                  ...templateData,
                  name: e.target.value,
                })
              }
              placeholder="Enter template name..."
            />
          </div>

          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              onClick={() => setPermissionModal(true)}
              className="btn btn-sm btn-outline-primary font-weight-bold w-100 mb-2 py-2">
              Select Pattern
            </button>

            <button
              type="button"
              onClick={onCheckHandler}
              className="btn btn-sm btn-success font-weight-bold w-100 mb-2 py-2">
              Save Template
            </button>

            {editFlag === "true" && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-sm btn-warning font-weight-bold w-100 py-2">
                Edit Mapped Data
              </button>
            )}
          </div>
        </div>
      </div>

      <EditMappedDataModel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        selectedCoordinates={selectedCoordinates}
      />

      {/* Embedded CSS tailored for narrow sidebars */}
      <style>{`
        .template-sidebar-wrapper {
          box-sizing: border-box;
        }

        .custom-sidebar-card {
          border-radius: 8px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
        }

        .extra-small {
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .template-scroll {
          max-height: 240px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .template-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .template-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .template-row {
          transition: background-color 0.15s ease-in-out;
        }

        .template-row:hover {
          background-color: #e0f2fe !important;
        }

        .btn-icon-only {
          padding: 2px 4px;
          background: transparent;
          border: none;
          line-height: 1;
          border-radius: 4px;
          transition: transform 0.1s ease, background-color 0.15s ease;
        }

        .btn-icon-only:hover {
          background-color: rgba(0, 0, 0, 0.05);
          transform: scale(1.15);
        }

        .icon-btn {
          font-size: 18px;
          vertical-align: middle;
        }

        .custom-input {
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          font-size: 13px;
        }

        .custom-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .tracking-wider {
          letter-spacing: 0.05em;
        }
      `}</style>
    </>
  );
};

export default TemplateData;