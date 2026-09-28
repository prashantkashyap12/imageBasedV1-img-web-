import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import getBaseUrl from "services/BackendApi";
import API_NODE from "../../apiNode/apiNode";

const SettingModel = ({
  settingModel,
  setsettingModel,
  token,
  templateId,
  templatePermissions,
  selectedCoordinates,
}) => {
  const [templateData, settemplateData] = useState();
  

  useEffect(() => {
    const fetchTempData = async () => {
      try {
        const data = await API_NODE.get(
          `${window.SERVER_IP}/get/templetedata/${templateId}`
        );
        settemplateData(data.data?.templetedata);
      } catch (error) {
        console.log("Error handled silently");
        settemplateData([]);
      }
    };

    fetchTempData();
  }, [templateId, selectedCoordinates]);

  const handleCheckboxChange = (e, type, id) => {
    const checked = e.target.checked;

    settemplateData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [type]: checked } : item
      )
    );
  };

  const handleSubmit = async () => {
    try {
      const updates = templateData.map((row) => ({
        id: row.id,
        pattern: row.pattern,
        blank: row.blank,
        empty: row.empty,
      }));

      const response = await API_NODE.put(
        `${window.SERVER_IP}/batch`,
        { updates },
        {
          headers: {
            token: token,
          },
        }
      );

      console.log("Updated rows:", response.data);
      setsettingModel(false);
      toast.success("Updated successfully!");
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <>
      {settingModel && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">Settings</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setsettingModel(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body">

                {/* Pattern Definition */}
                <div className="card mb-2">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <strong>Pattern Definition:</strong>
                    <span style={{ fontSize: "20px" }}>
                      {templatePermissions.patternDefinition || "— Not Defined —"}
                    </span>
                  </div>
                </div>

                {/* Blank Definition */}
                <div className="card mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <strong>Blank Definition:</strong>
                    <span style={{ fontSize: "20px" }}>
                      {templatePermissions.blankDefination || "— Not Defined —"}
                    </span>
                  </div>
                </div>

                {/* Fields List */}
                {templateData
                  ?.filter((field) => field.fieldType === "formField" && field)
                  .map((data, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center border-bottom py-3"
                    >
                      {/* Attribute */}
                      <span className="fw-semibold fs-5">
                        {data.attribute}
                      </span>

                      {/* Checkboxes */}
                      <div className="d-flex gap-4 align-items-center">

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={data.pattern}
                            onChange={(e) =>
                              handleCheckboxChange(e, "pattern", data.id)
                            }
                          />
                          <label className="form-check-label">
                            Pattern
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={data.blank}
                            onChange={(e) =>
                              handleCheckboxChange(e, "blank", data.id)
                            }
                          />
                          <label className="form-check-label">
                            Blank
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={data.empty}
                            onChange={(e) =>
                              handleCheckboxChange(e, "empty", data.id)
                            }
                          />
                          <label className="form-check-label">
                            Empty
                          </label>
                        </div>

                      </div>
                    </div>
                  ))}
              </div>

              {/* Footer */}
              <div className="modal-footer justify-content-center">
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary px-4"
                >
                  Save
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingModel;