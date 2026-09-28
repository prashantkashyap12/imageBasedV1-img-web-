import React from "react";
import { toast } from "react-toastify";
import Draggable from "react-draggable";

const OptionData = ({
  optionModel,
  setOptionModel,
  inputCount,
  setInputCount,
  createInputs,
  handleCreateInputs,
  setConfirmationModal,
  selectedRow,
}) => {
  return (
    <>
      {optionModel && (
        <div
          className="position-fixed top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 1050,
          }}
        >
          <Draggable handle=".drag-handle" cancel="input, textarea, button">
            <div
              className="bg-white rounded-4 shadow-lg w-100"
              style={{
                maxWidth: "600px",
                animation: "fadeInScale 0.25s ease",
              }}
            >
              {/* Header */}
              <div className="drag-handle px-4 py-3 border-bottom">
                <h4 className="fw-bold m-0">
                  Create Option Inputs
                </h4>
                <small className="text-muted">
                  Define number of input boxes for options
                </small>
              </div>

              {/* Body */}
              <div
                className="p-4 overflow-auto"
                style={{ maxHeight: "60vh" }}
              >
                {/* Input + Button */}
                <div className="d-flex gap-2 mb-3 justify-content-between mx-2">
                  <input
                    type="number"
                    value={inputCount}
                    onChange={(e) =>
                      setInputCount(parseInt(e.target.value))
                    }
                    className="form-control rounded-3"
                    style={{ maxWidth: "180px" }}
                    placeholder="No. of inputs"
                  />

                  <button
                    type="button"
                    className="btn btn-dark rounded-pill px-4 "
                    onClick={handleCreateInputs}
                  >
                    Create
                  </button>
                </div>

                {/* Dynamic Inputs */}
                <div>{createInputs()}</div>
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-end gap-2 px-4 py-3 border-top">
                <button
                  onClick={() => setOptionModel(false)}
                  className="btn btn-light rounded-pill px-4"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!selectedRow) {
                      toast.warning(
                        "Please select the field option type."
                      );
                      return;
                    } else {
                      setConfirmationModal(true);
                      setOptionModel(false);
                    }
                  }}
                  className="btn btn-success rounded-pill px-4"
                >
                  Submit
                </button>
              </div>
            </div>
          </Draggable>
        </div>
      )}
    </>
  );
};

export default OptionData;