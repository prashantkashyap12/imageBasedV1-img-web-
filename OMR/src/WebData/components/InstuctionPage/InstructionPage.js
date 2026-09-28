import React from "react";
import { IoSend, IoClose } from "react-icons/io5";

const InstructionPage = ({ setInstruction, instruction, handleFinalSubmit }) => {
  if (!instruction) return null;

  return (
    <>
      {/* Overlay */}
      <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 9998, }} onClick={() => setInstruction(false)}></div>

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle bg-white rounded shadow"
        style={{ zIndex: 9999, width: "600px", maxWidth: "90%", border: "2px solid #198754", }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom p-3">
          <h2 className="text-success fw-bold m-0">Instructions</h2>
          <button className="btn" onClick={() => setInstruction(false)} style={{ border: "none", background: "transparent" }}>
            <IoClose size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 text-black">
          <h6 className="fw-semibold">Shortcut Keys</h6>
          <ul>
            <li>A. Left Arrow / Page Down - Previous image</li>
            <li>B. Right Arrow / Page Up - Next image</li>
          </ul>

          <h6 className="fw-semibold mt-3">
            On Selecting the Form Field
          </h6>
          <ul>
            <li>Select form field type (Text/Number/Alphanumeric)</li>
            <li>For Number → add Start & End Value</li>
            <li>Add Form Field length</li>
            <li>Add Form Field Name</li>
          </ul>

          <h6 className="fw-semibold mt-3">
            On Selecting the Question Field
          </h6>
          <ul>
            <li>Add Start and End Question number</li>
          </ul>

        </div>

        {/* Footer */}
        <div className="d-flex justify-content-end gap-2 border-top p-3">
          <button className="btn btn-secondary" onClick={() => setInstruction(false)}>
            Cancel
          </button>

          <button className="btn btn-success d-flex align-items-center" onClick={handleFinalSubmit}>
            Save Images <IoSend className="ms-2" />
          </button>
        </div>
      </div>
    </>
  );
};

export default InstructionPage;