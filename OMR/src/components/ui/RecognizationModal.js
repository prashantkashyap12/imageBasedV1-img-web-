
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchAllTemplate, updateTemplate } from "helper/TemplateHelper";
import getBaseUrl from "services/BackendApi";

const RecognizationModal = ({ show, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [paths, setPaths] = useState(null); // selected template
  const [allFields, setAllFields] = useState([]);
  const [baseUrl, setBaseUrl] = useState(null);

  // 1️⃣ Get base URL
  useEffect(() => {
    const fetchBaseUrl = async () => {
      const url = await getBaseUrl();
      setBaseUrl(url);
    };
    fetchBaseUrl();
  }, []);

  // 2️⃣ Fetch selected template and its fields
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const templateId = localStorage.getItem("templateId");
        if (!templateId) return;

        const templates = await fetchAllTemplate();
        const matchedTemplate = templates?.body?.find(
          (t) => String(t.id) === String(templateId),
        );
        if (!matchedTemplate) return;

        setPaths(matchedTemplate);

        if (baseUrl && matchedTemplate.jsonPath) {
          const res = await axios.get(`${baseUrl}${matchedTemplate.jsonPath}`, {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          });
          setAllFields(res.data.fields || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [baseUrl]);

  // 3️⃣ Handle slider changes
  const handleBubbleChange = (e, idx) => {
    const value = +e.target.value;
    setAllFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, bubbleIntensity: value } : f)),
    );
  };

  // 4️⃣ Save updated fields
  const handleSave = async () => {
    if (!paths) return;

    const result = window.confirm("Are you sure you want to save?");
    if (!result) return;

    const obj = {
      name: paths.fileName,
      fields: allFields,
    };

    const jsonString = JSON.stringify(obj);
    const jsonFileName = paths.fileName.endsWith(".json")
      ? paths.fileName
      : `${paths.fileName}.json`;

    const jsonFile = new File([jsonString], jsonFileName, {
      type: "application/json",
    });

    const res = await updateTemplate(paths.fileName, jsonFile);
    if (res?.state) {
      toast.success("Configuration Saved Successfully");
      onClose();
    }
  };

  // 5️⃣ Render fields
  const Fields = allFields.map((item, index) => (
    <div
      key={index}
      className="border-chase-btn upload-box border rounded mb-3"
    >
      <div className="d-flex justify-content-end mt-0">
        <h3>
          <strong>Field Name:</strong> {item.fieldName}
        </h3>
      </div>

      <div className="mb-1" style={{ fontSize: 15 }}>
        <strong>Field Type:</strong> {item.fieldType}
      </div>

      <div className="mb-1" style={{ fontSize: 15 }}>
        <strong>Field Value:</strong> {item.fieldValue}
      </div>

      <div className="form-group mb-1" style={{ fontSize: 15 }}>
        <label htmlFor={`bubble-${index}`}>
          <strong>
            Bubble Intensity:{" "}
            <span style={{ color: "blue" }}>{item.bubbleIntensity}</span>
          </strong>
        </label>

        <div className="d-flex">
          <h4 className="mb-0 mr-1 ">0</h4>

          <input
            type="range"
            id={`bubble-${index}`}
            className="form-range flex-grow-1 bubble-range"
            value={item.bubbleIntensity || 0}
            min={-1}
            max={30}
            step={0.1}
            onChange={(e) => handleBubbleChange(e, index)}
          />

          <h4 className="mb-0 ml-1">30</h4>
        </div>
      </div>
    </div>
  ));

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="md"
      aria-labelledby="modal-custom-navbar"
      centered
      dialogClassName="modal-90w"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header
        style={{
          borderBottom: "none",
          boxShadow: "0px 0px 6px 0px rgba(0,0,0,0.15)",
          zIndex: 99,
        }}
      >
        <Modal.Title id="modal-custom-navbar" style={{ fontSize: "20px" }}>
          Configure Recognization
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{
          height: "65dvh",
          overflowY: "auto",
          scrollbarWidth: "none",
          fontFamily: "inherit",
        }}
      >
        {loading ? <div>Loading...</div> : Fields}
        <style jsx>{`
          .bubble-range {
            accent-color: #0984e3;
          }

          .upload-box {
            cursor: pointer;
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
          }
          .upload-box:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            // color: #ffffff
          }

          .border-chase-btn {
            position: relative;
            background: #f1f2f0;
            border: none;
            // color: #2ecc71;
            padding: 14px 26px;
            cursor: pointer;
            font-size: 16px;
            // font-weight: bold;
            transition: color 0.4s;
          }

          .border-chase-btn::before,
          .border-chase-btn::after {
            content: "";
            position: absolute;
            width: 0;
            height: 2px;
            // background: #2ecc71;
            background: #0066ff;

            transition: width 0.25s ease-out;
          }

          .border-chase-btn span::before,
          .border-chase-btn span::after {
            content: "";
            position: absolute;
            width: 2px;
            height: 0;
            // background: #2ecc71;
            background: #0066ff;
            transition: height 0.25s ease-out;
          }

          .border-chase-btn::before {
            top: 0;
            left: 0;
          }
          .border-chase-btn::after {
            bottom: 0;
            right: 0;
            transition-delay: 0.25s;
          }
          .border-chase-btn span::before {
            top: 0;
            right: 0;
            transition-delay: 0.15s;
          }
          .border-chase-btn span::after {
            bottom: 0;
            left: 0;
            transition-delay: 0.45s;
          }

          .border-chase-btn:hover::before,
          .border-chase-btn:hover::after {
            width: 100%;
          }

          .border-chase-btn:hover span::before,
          .border-chase-btn:hover span::after {
            height: 100%;
          }
        `}</style>
      </Modal.Body>

      <Modal.Footer
        style={{ boxShadow: "0px -0px 6px 0px rgba(0,0,0,0.15)", zIndex: 99 }}
      >
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save Recognisation settings
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecognizationModal;
