import React from "react";

const DynamicInput = ({
  inputValues,
  handleInputChange,
  handleCheckboxChange,
  selectedRow,
}) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "123456789";
  const lowerAlphabet = "abcdefghijklmnopqrstuvwxyz";

  return (
    <div className="container-fluid p-0">

      {/* Uppercase */}
      <div className="card shadow-sm mb-4 border-0 rounded-4">
        <div className="card-body">
          
          {/* Header */}
          <div className="d-flex align-items-center mb-3">
            <input
              type="checkbox"
              id="upper"
              className="form-check-input me-2"
              checked={selectedRow === "upper"}
              onChange={() => handleCheckboxChange("upper")}
            />
            <label htmlFor="upper" className="fw-semibold fs-5 mb-0">
              Uppercase Letters
            </label>
          </div>

          {/* Inputs */}
          <div className="row g-2">
            {inputValues.map((_, i) => (
              <div key={`upper-${i}`} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <input
                  type="text"
                  className="form-control text-center rounded-3"
                  value={inputValues[i]?.upper || alphabet[i % 26]}
                  onChange={(e) => handleInputChange(e, "upper", i)}
                  placeholder={`Upper ${i + 1}`}
                  disabled={selectedRow !== "upper"}
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Lowercase */}
      <div className="card shadow-sm mb-4 border-0 rounded-4">
        <div className="card-body">

          <div className="d-flex align-items-center mb-3">
            <input
              type="checkbox"
              id="lower"
              className="form-check-input me-2"
              checked={selectedRow === "lower"}
              onChange={() => handleCheckboxChange("lower")}
            />
            <label htmlFor="lower" className="fw-semibold fs-5 mb-0">
              Lowercase Letters
            </label>
          </div>

          <div className="row g-2">
            {inputValues.map((_, i) => (
              <div key={`lower-${i}`} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <input
                  type="text"
                  className="form-control text-center rounded-3"
                  value={inputValues[i]?.lower || lowerAlphabet[i % 26]}
                  onChange={(e) => handleInputChange(e, "lower", i)}
                  placeholder={`Lower ${i + 1}`}
                  disabled={selectedRow !== "lower"}
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Numbers */}
      <div className="card shadow-sm mb-4 border-0 rounded-4">
        <div className="card-body">

          <div className="d-flex align-items-center mb-3">
            <input
              type="checkbox"
              id="number"
              className="form-check-input me-2"
              checked={selectedRow === "number"}
              onChange={() => handleCheckboxChange("number")}
            />
            <label htmlFor="number" className="fw-semibold fs-5 mb-0">
              Numbers
            </label>
          </div>

          <div className="row g-2">
            {inputValues.map((_, i) => (
              <div key={`number-${i}`} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <input
                  type="text"
                  className="form-control text-center rounded-3"
                  value={inputValues[i]?.number || numbers[i % 9]}
                  onChange={(e) => handleInputChange(e, "number", i)}
                  placeholder={`Number ${i + 1}`}
                  disabled={selectedRow !== "number"}
                />
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

export default DynamicInput;