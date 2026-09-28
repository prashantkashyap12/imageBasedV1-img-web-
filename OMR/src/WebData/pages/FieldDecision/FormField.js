import React from "react";

const FormField = ({
  setAllProperties,
  formFields,
  checkedData,
  onCheckBoxHandler,
}) => {
  return (
    <div className="mb-4 mt-4">
      <div className="card shadow-sm border-0">

        {/* HEADER */}
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold">
            Form Fields
          </h5>
          <small>(P: Pattern, B: Blank, L: Legal)</small>
        </div>

        <div className="card-body">

          {/* BULK ACTION */}
          <div className="d-flex justify-content-end gap-3 mb-3 flex-wrap">

            <div className="form-check">
              <input
                type="checkbox"
                onChange={() => setAllProperties("legal", "formField")}
                className="form-check-input"
                id="legalAll"
              />
              <label className="form-check-label small" htmlFor="legalAll">
                Legal
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                onChange={() => setAllProperties("pattern", "formField")}
                className="form-check-input"
                id="patternAll"
              />
              <label className="form-check-label small" htmlFor="patternAll">
                Pattern
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                onChange={() => setAllProperties("blank", "formField")}
                className="form-check-input"
                id="blankAll"
              />
              <label className="form-check-label small" htmlFor="blankAll">
                Blank
              </label>
            </div>

          </div>

          {/* FIELDS LIST */}
          <div className="row g-3">
            {Object.entries({ ...formFields }).map(([key, value], i) => (
              <div key={i} className="col-12 col-md-6">
                <div className="d-flex justify-content-between align-items-center border rounded p-2">

                  {/* FIELD NAME */}
                  <span
                    className="fw-medium text-truncate"
                    style={{ maxWidth: "140px" }}
                  >
                    {value}
                  </span>

                  {/* CHECKBOXES */}
                  <div className="d-flex gap-3">

                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={checkedData[value]?.legal}
                        onChange={() => onCheckBoxHandler(value, "Legal")}
                        className="form-check-input"
                        id={`legal-${i}`}
                      />
                      <label className="form-check-label small" htmlFor={`legal-${i}`}>
                        L
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={checkedData[value]?.pattern}
                        onChange={() => onCheckBoxHandler(value, "Pattern")}
                        className="form-check-input"
                        id={`pattern-${i}`}
                      />
                      <label className="form-check-label small" htmlFor={`pattern-${i}`}>
                        P
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={checkedData[value]?.blank}
                        onChange={() => onCheckBoxHandler(value, "Blank")}
                        className="form-check-input"
                        id={`blank-${i}`}
                      />
                      <label className="form-check-label small" htmlFor={`blank-${i}`}>
                        B
                      </label>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FormField;