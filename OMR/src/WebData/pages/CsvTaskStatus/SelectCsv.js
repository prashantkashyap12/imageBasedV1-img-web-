import React from "react";

const SelectCsv = ({
  templates,
  onGetAllCsvHandler,
  loadingTemplates,
  getCsvHeadersHandler,
  loadingCsv,
  allSelectedCsv,
  csvHeaders,
  setSelectedHeader,
  selectedHeader,
  onGetAllTaskStatusHandler,
  loadingData,
  headerValue,
  setHeaderValue,
}) => {
  return (
    <div className="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div
        className="row w-100 shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "1100px" }}
      >
        {/* LEFT SIDE */}
        <div className="col-md-4 bg-primary text-white p-4 d-flex flex-column justify-content-center">
          <h4 className="fw-bold mb-4">📊 Task Finder</h4>

          <div className="step-item">
            <span className="step-number">1</span>
            <p>Select Template</p>
          </div>

          <div className="step-item">
            <span className="step-number">2</span>
            <p>Choose CSV File</p>
          </div>

          <div className="step-item">
            <span className="step-number">3</span>
            <p>Select Search Field</p>
          </div>

          <div className="step-item">
            <span className="step-number">4</span>
            <p>Find Task Status</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-8 bg-light p-4">
          <div className="form-card shadow-sm">
            <h5 className="fw-semibold mb-4">Find Task Status</h5>

            <div className="row g-4">
              {/* Template */}
              <div className="col-md-6">
                <div className="field-card">
                  <label>Template</label>
                  <div className="position-relative">
                    <select
                      className="form-select modern-select"
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue !== "Select Template") {
                          onGetAllCsvHandler(selectedValue);
                        }
                      }}
                      disabled={loadingTemplates}
                    >
                      <option>Select Template</option>
                      {templates?.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>

                    {loadingTemplates && (
                      <div className="spinner-pos">
                        <div className="spinner-border spinner-border-sm text-primary"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CSV */}
              <div className="col-md-6">
                <div className="field-card">
                  <label>CSV File</label>
                  <div className="position-relative">
                    <select
                      className="form-select modern-select"
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue !== "Select CSV File") {
                          getCsvHeadersHandler(selectedValue);
                        }
                      }}
                      disabled={loadingCsv}
                    >
                      <option>Select CSV File</option>
                      {allSelectedCsv?.map((csv) => (
                        <option key={csv.id} value={csv.id}>
                          {csv.csvFile}
                        </option>
                      ))}
                    </select>

                    {loadingCsv && (
                      <div className="spinner-pos">
                        <div className="spinner-border spinner-border-sm text-primary"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="col-md-12">
                <div className="field-card">
                  <label>Search Field</label>
                  <select
                    className="form-select modern-select"
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue !== "Select Option") {
                        setSelectedHeader(selectedValue);
                      }
                    }}
                  >
                    <option>Select Option</option>
                    {csvHeaders?.map((header, i) => (
                      <option key={i} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search Section */}
            {selectedHeader && (
              <div className="search-card mt-4">
                <label className="mb-2">
                  Search by{" "}
                  <span className="text-primary">{selectedHeader}</span>
                </label>

                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control modern-input"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                    placeholder={`Enter ${selectedHeader}`}
                  />

                  <button
                    onClick={onGetAllTaskStatusHandler}
                    className="btn btn-primary px-4"
                    disabled={loadingData}
                  >
                    {loadingData ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
                .step-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    opacity: 0.9;
                }

                .step-number {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    background: white;
                    color: #0d6efd;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 10px;
                }

                .form-card {
                    background: #ffffff;
                    padding: 25px;
                    border-radius: 14px;
                }

                .field-card {
                    background: #f8f9fb;
                    padding: 12px 14px;
                    border-radius: 10px;
                    border: 1px solid #eef1f4;
                    transition: all 0.2s ease;
                }

                .field-card:hover {
                    border-color: #0d6efd30;
                    background: #fff;
                }

                .field-card label {
                    font-size: 12px;
                    color: #6c757d;
                    margin-bottom: 6px;
                    display: block;
                }

                .modern-select {
                    border: none;
                    background: transparent;
                    font-size: 14px;
                    padding: 6px 0;
                    box-shadow: none !important;
                }

                .modern-select:focus {
                    outline: none;
                }

                .modern-input {
                    border-radius: 8px;
                    border: 1px solid #dee2e6;
                    padding: 10px;
                }

                .modern-input:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.1rem rgba(13,110,253,.15);
                }

                .search-card {
                    background: #f8f9fb;
                    padding: 15px;
                    border-radius: 10px;
                    border: 1px solid #eef1f4;
                }

                .spinner-pos {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                }
            `}</style>
    </div>
  );
};

export default SelectCsv;
