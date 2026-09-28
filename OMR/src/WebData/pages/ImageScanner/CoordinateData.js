import React from "react";
import Draggable from "react-draggable";
import { RxCross2 } from "react-icons/rx";

const CoordinateData = ({
  onSelectedHandler,
  open,
  onResetHandler,
  fieldType,
  setFieldType,
  setSelectType,
  selectType,
  questionRange,
  setQuestionRange,
  lengthOfField,
  setLengthOfField,
  inputField,
  setInputField,
}) => {
  return (
    <>
      {open && (
        <div
          className="position-fixed top-0 start-0 h-50 w-50 vh-100 d-flex justify-content-center align-items-center"
          style={{ zIndex: 99999, }}        >
          <Draggable handle=".modal-header" cancel="input, select, textarea">
            <div
              className="bg-white rounded-4 shadow-lg"
              style={{ width: "100%", maxWidth: "560px", overflow: "hidden", }}>
              {/* Header */}
              <div className="modal-header px-4 py-3 border-bottom cursor-move">
                <h5 className="fw-semibold m-0">Add Field</h5>
                {/* <span onClick={onResetHandler} className="bg-primary text-white rounded px-2 py-1" style={{ cursor: "pointer" }}>
                  <RxCross2 size={22} />
                </span> */}
              </div>

              {/* Body */}
              <div className="p-4">
                {/* Toggle */}
                <div className="d-flex gap-3 mb-4">
                  <button
                    className={`btn ${fieldType === "formField"
                      ? "btn-dark"
                      : "btn-outline-secondary"
                      } rounded-pill px-3`}
                    onClick={() => setFieldType("formField")}>
                    Form Field
                  </button>

                  <button
                    className={`btn ${fieldType === "questionsField"
                      ? "btn-dark"
                      : "btn-outline-secondary"
                      } rounded-pill px-3`}
                    onClick={() => setFieldType("questionsField")}>
                    Question Field
                  </button>
                </div>

                {/* Form Field */}
                {fieldType === "formField" && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold mb-2">
                        Field Type
                      </label>

                      <select
                        value={selectType}
                        onChange={(e) => setSelectType(e.target.value)}
                        className="custom-select-ui">
                        <option value="">Select Type</option>
                        <option value="text">Alpha</option>
                        <option value="number">Numeric</option>
                        <option value="alphanumeric">AlphaNumeric</option>
                      </select>
                    </div>

                    <style jsx>
                      {`
                        .custom-select-ui {
                          width: 100%;
                          padding: 10px 14px;
                          border-radius: 12px;
                          border: none;
                          outline: none;
                          background-color: #f8fafc;
                          font-weight: 500;
                          transition: all 0.25s ease;
                          box-shadow: inset 0 0 0 1px transparent;
                        }

                        /* Hover effect */
                        .custom-select-ui:hover {
                          background-color: #f1f5f9;
                        }

                        /* Focus animation */
                        .custom-select-ui:focus {
                          background-color: #ffffff;
                          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.15);
                        }

                        /* Optional: remove default arrow (for custom styling later) */
                        .custom-select-ui {
                          appearance: none;
                        }
                      `}
                    </style>

                    {selectType === "number" && (
                      <div className="d-flex gap-3 mb-3">
                        <input
                          type="number"
                          placeholder="Start"
                          value={questionRange.min}
                          onChange={(e) =>
                            setQuestionRange({
                              ...questionRange,
                              min: e.target.value,
                            })
                          }
                          className="form-control rounded-3"
                        />
                        <input
                          type="number"
                          placeholder="End"
                          value={questionRange.max}
                          onChange={(e) =>
                            setQuestionRange({
                              ...questionRange,
                              max: e.target.value,
                            })
                          }
                          className="form-control rounded-3"
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Field Length
                      </label>
                      <input
                        type="number"
                        value={lengthOfField}
                        onChange={(e) => setLengthOfField(e.target.value)}
                        className="form-control rounded-3"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Field Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter field name..."
                        value={inputField}
                        onChange={(e) => setInputField(e.target.value)}
                        className="form-control rounded-3"
                      />
                    </div>
                  </>
                )}

                {/* Question Field */}
                {fieldType === "questionsField" && (
                  <div className="d-flex gap-3 mb-4">
                    <input
                      type="number"
                      placeholder="Start"
                      value={questionRange.min}
                      onChange={(e) =>
                        setQuestionRange({
                          ...questionRange,
                          min: e.target.value,
                        })
                      }
                      className="form-control rounded-3"
                    />

                    <input
                      type="number"
                      placeholder="End"
                      value={questionRange.max}
                      onChange={(e) =>
                        setQuestionRange({
                          ...questionRange,
                          max: e.target.value,
                        })
                      }
                      className="form-control rounded-3"
                    />
                  </div>
                )}

                {/* Footer */}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-light px-4 rounded-pill"
                    onClick={onResetHandler}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-dark px-4 rounded-pill"
                    onClick={onSelectedHandler}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </Draggable>
        </div>
      )}
    </>
  );
};

export default CoordinateData;
