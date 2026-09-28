import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";

const UploadSection = ({
  onImageFolderHandler,
  setEditId,
  setEditModal,
  data,
  templateName,
  setTemplateName,
  imageNames,
  filteredTemplates,
  selectedId,
  setSelectedId,
  setRemoveModal,
  setRemoveId,
  handleImageNameChange,
  UploadFile,
  csvFile,
  onCsvFileHandler,
  imageFolder,
  setOpenPreFile,
  onGetCsvInfoHandler,
  onFileHeaderDetailsHandler,
}) => {
  const [enteredImageName, setEnteredImageName] = useState(null);

  useEffect(() => {
    if (data?.imageColName) {
      handleImageNameChange(0, data?.imageColName);
    }
  }, [data]);

  localStorage.setItem("templeteId", selectedId);

  return (
    <div className="tablet-single-column-wrapper my-3 mx-auto px-3">
      {/* Bootstrap 4.6.2 Single Column Tablet Styling */}
      <style>{`
        .tablet-single-column-wrapper {
          max-width: 680px; /* Tablet portrait single-column width */
        }
        .tablet-card {
          border-radius: 1.25rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          background-color: #ffffff;
        }
        .tablet-dropzone {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 150px;
          padding: 1.5rem;
          border: 2px dashed #cbd5e1;
          border-radius: 1rem;
          background-color: #f8fafc;
          transition: all 0.2s ease-in-out;
          text-align: center;
          cursor: pointer;
        }
        .tablet-dropzone:hover {
          border-color: #007bff;
          background-color: #f1f5f9;
        }
        .tablet-dropzone input[type="file"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .template-scroll-list {
          max-height: 180px;
          overflow-y: auto;
          border-radius: 0.75rem;
        }
        .search-input-wrapper {
          position: relative;
        }
        .search-input-wrapper .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
          align-items: center;
        }
        .search-input-wrapper input {
          padding-left: 42px;
          height: 44px;
          font-size: 0.9rem;
        }
        .template-item {
          cursor: pointer;
          min-height: 44px;
          transition: all 0.15s ease-in-out;
        }
        .touch-btn {
          height: 46px;
          border-radius: 0.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .rounded-lg {
          border-radius: 0.75rem !important;
        }
      `}</style>

      <div className="row">
        {/* 1. TEMPLATE SECTION */}
        <div className="col-12 mb-4">
          <div className="card tablet-card p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h6 className="font-weight-bold text-dark mb-0 d-flex align-items-center">
                <span
                  className="rounded-circle bg-primary mr-2"
                  style={{ width: "10px", height: "10px", display: "inline-block" }}
                ></span>
                Template Name
              </h6>
              <span className="badge badge-pill badge-light text-muted px-3 py-1 font-weight-bold">
                {filteredTemplates?.length || 0}
              </span>
            </div>

            {/* Search Input */}
            <div className="search-input-wrapper mb-3">
              <span className="search-icon">
                <IoSearch style={{ fontSize: 20 }} />
              </span>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Search templates..."
                className="form-control rounded-lg bg-light border-0"
              />
            </div>

            {/* Template Scroll List */}
            <div className="template-scroll-list border p-1 bg-light mb-3">
              {filteredTemplates?.map((template) => {
                const isSelected = selectedId === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    className={`template-item d-flex align-items-center justify-content-between px-3 py-2 rounded mb-1 ${
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-dark border"
                    }`}
                  >
                    <span className="text-truncate pr-2 font-weight-semibold" style={{ fontSize: "0.875rem" }}>
                      {template.name}
                    </span>

                    <div className="d-flex align-items-center shrink-0">
                      <CiEdit
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModal(true);
                          setEditId(template.id);
                        }}
                        className={`mr-2 ${isSelected ? "text-white" : "text-primary"}`}
                        style={{ cursor: "pointer", fontSize: 20 }}
                      />
                      <MdDelete
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveModal(true);
                          setRemoveId(template.id);
                        }}
                        className={isSelected ? "text-white" : "text-danger"}
                        style={{ cursor: "pointer", fontSize: 20 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic Inputs */}
            <div className="pt-3 border-top">
              <label className="small font-weight-bold text-muted d-block mb-2">
                Image Fields Configuration
              </label>
              {data &&
                Array.from({ length: data.pageCount }).map((_, index) => (
                  <input
                    key={index}
                    disabled={!!data?.imageColName}
                    type="text"
                    value={
                      imageNames[index] !== undefined
                        ? imageNames[index]
                        : data?.imageColName
                    }
                    onChange={(e) => {
                      if (!data?.imageColName) {
                        handleImageNameChange(index, e.target.value);
                      }
                    }}
                    placeholder={
                      data.pageCount === 1
                        ? "Image Name"
                        : `${index === 0 ? "First" : "Second"} Image Name`
                    }
                    className="form-control text-center mb-2 font-weight-bold rounded-lg"
                    style={{ height: "42px", fontSize: "0.875rem" }}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* 2. CSV UPLOAD SECTION */}
        <div className="col-12 mb-4">
          <div className="card tablet-card p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h6 className="font-weight-bold text-dark mb-0">Upload CSV File</h6>
              <span className="badge badge-success px-2.5 py-1 font-weight-normal">
                Required
              </span>
            </div>

            <div className="tablet-dropzone">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={onCsvFileHandler}
              />
              <img
                src={UploadFile}
                alt="upload"
                className="mb-2"
                style={{ width: "52px", height: "52px", objectFit: "contain" }}
              />
              <p className="font-weight-bold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                Tap or Drag File Here
              </p>
              <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                Supports .csv, .xlsx
              </p>
            </div>

            <div className="mt-3 pt-3 border-top small text-muted text-truncate">
              <strong>Selected:</strong> {csvFile?.name || "No file selected"}
            </div>
          </div>
        </div>

        {/* 3. ZIP UPLOAD SECTION */}
        <div className="col-12 mb-4">
          <div className="card tablet-card p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h6 className="font-weight-bold text-dark mb-0">Upload Image Folder</h6>
              <span className="badge badge-info px-2.5 py-1 font-weight-normal">
                Required
              </span>
            </div>

            <div className="tablet-dropzone">
              <input
                type="file"
                accept=".zip,.folder,.rar"
                onChange={onImageFolderHandler}
              />
              <img
                src={UploadFile}
                alt="upload"
                className="mb-2"
                style={{ width: "52px", height: "52px", objectFit: "contain" }}
              />
              <p className="font-weight-bold text-dark mb-1" style={{ fontSize: "0.9rem" }}>
                Tap or Drag Image Archive
              </p>
              <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
                Supports .zip, .rar, folder
              </p>
            </div>

            <div className="mt-3 pt-3 border-top small text-muted text-truncate">
              <strong>Selected:</strong> {imageFolder?.name || "No file selected"}
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="card tablet-card p-3 d-flex flex-row align-items-center justify-content-end mb-4">
        {selectedId && (
          <button
            type="button"
            onClick={() => {
              setOpenPreFile(true);
              onGetCsvInfoHandler();
            }}
            className="btn btn-outline-info touch-btn font-weight-bold mr-3 px-4"
          >
            Pre Files
          </button>
        )}

        <button
          type="button"
          onClick={onFileHeaderDetailsHandler}
          className="btn btn-primary touch-btn font-weight-bold px-5 shadow-sm"
        >
          Save Files
        </button>
      </div>
    </div>
  );
};

export default UploadSection;