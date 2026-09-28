import React from "react";

const EditDuplicateData = ({
  currentRowData,
  imageNames,
  changeCurrentCsvDataHandler,
  setEditModal,
  onUpdateCurrentDataHandler,
}) => {
  return (
    <div className="d-flex justify-content-center">
      <div className="card shadow-sm border-0 rounded-4 w-100">

        {/* HEADER */}
        <div className="card-header bg-white fw-bold text-center">
          Edit Data
        </div>

        {/* BODY */}
        <div
          className="card-body"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {currentRowData &&
            Object.entries(currentRowData).map(([key, value]) => {
              if (
                key === "Previous Values" ||
                key === "Updated Values" ||
                key === "User Details" ||
                key === "Updated Col. Name" ||
                imageNames.includes(key)
              ) {
                return null;
              } else {
                return (
                  <div className="row mb-3 align-items-center" key={key}>
                    
                    {/* LABEL */}
                    <div className="col-5 fw-semibold text-capitalize">
                      {key}
                    </div>

                    {/* INPUT */}
                    <div className="col-7">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={value}
                        value={value}
                        onChange={(e) =>
                          changeCurrentCsvDataHandler(
                            key,
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>
                );
              }
            })}
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white d-flex justify-content-between">
          <button
            onClick={() => setEditModal(false)}
            className="btn btn-outline-secondary px-4"
          >
            Back
          </button>

          <button
            onClick={() => {
              onUpdateCurrentDataHandler(currentRowData.id);
            }}
            className="btn btn-primary px-4"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditDuplicateData;