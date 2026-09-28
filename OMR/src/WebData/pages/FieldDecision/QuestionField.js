import React from "react";

const QuestionField = ({
  setAllProperties,
  questionsField,
  checkedData,
  onCheckBoxHandler,
}) => {
  return (
    <div>
      {questionsField.length > 0 && (
        <div className="card shadow-sm border-0 mt-4">

          {/* HEADER */}
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold">
              Questions Fields
            </h5>
            <small>(P: Pattern, B: Blank)</small>
          </div>

          <div className="card-body">

            {/* BULK ACTION */}
            <div className="d-flex justify-content-end gap-3 mb-3 flex-wrap">

              <div className="form-check">
                <input
                  type="checkbox"
                  onChange={() =>
                    setAllProperties("pattern", "questionsField")
                  }
                  className="form-check-input"
                  id="patternAllQ"
                />
                <label className="form-check-label small" htmlFor="patternAllQ">
                  Pattern
                </label>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  onChange={() =>
                    setAllProperties("blank", "questionsField")
                  }
                  className="form-check-input"
                  id="blankAllQ"
                />
                <label className="form-check-label small" htmlFor="blankAllQ">
                  Blank
                </label>
              </div>

            </div>

            {/* QUESTIONS GRID */}
            <div className="row g-3 mt-2">
              {questionsField.map((question, i) => (
                <div key={i} className="col-12 col-sm-6 col-lg-3">
                  <div className="d-flex justify-content-between align-items-center border rounded p-2">

                    {/* QUESTION NAME */}
                    <span
                      className="fw-medium text-truncate"
                      style={{ maxWidth: "90px" }}
                    >
                      {question}
                    </span>

                    {/* CHECKBOXES */}
                    <div className="d-flex gap-2">

                      <div className="form-check">
                        <input
                          type="checkbox"
                          checked={checkedData[question]?.pattern}
                          onChange={() =>
                            onCheckBoxHandler(question, "Pattern")
                          }
                          className="form-check-input"
                          id={`q-pattern-${i}`}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor={`q-pattern-${i}`}
                        >
                          P
                        </label>
                      </div>

                      <div className="form-check">
                        <input
                          type="checkbox"
                          checked={checkedData[question]?.blank}
                          onChange={() =>
                            onCheckBoxHandler(question, "Blank")
                          }
                          className="form-check-input"
                          id={`q-blank-${i}`}
                        />
                        <label
                          className="form-check-label small"
                          htmlFor={`q-blank-${i}`}
                        >
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
      )}
    </div>
  );
};

export default QuestionField;