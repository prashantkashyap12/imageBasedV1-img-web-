import React, { useEffect, useState } from "react";
import HeaderData from "../TemplateMapping/HeaderData";
import HeaderMappedReview from "../TemplateMapping/HeaderMappedReview";
import { useNavigate } from "react-router-dom";
import {
  checkMappedDataExits,
  submitMappedData,
} from "../../services/common";
import { toast } from "react-toastify";

const EditMappedDataModel = ({ isOpen, onClose, selectedCoordinates }) => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [templateHeaders, setTemplateHeaders] = useState([]);
  const [selectedAssociations, setSelectedAssociations] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [prevValue, setPrevValue] = useState([]);

  const navigate = useNavigate();

  const fileId = JSON.parse(localStorage.getItem("fileId")) || "";
  const templateId = JSON.parse(localStorage.getItem("templeteId"));

  useEffect(() => {
    if (!isOpen) return;

    const fetchTemplate = async () => {
      try {
        const response = await checkMappedDataExits(templateId);

        const keys = response?.records?.map((item) => item.key) || [];
        const values = response?.records?.map((item) => item.value) || [];

        setCsvHeaders(keys);
        setPrevValue(values);

        const latestData =
          selectedCoordinates?.map((item) => item.attribute) || [];
        setTemplateHeaders(latestData);

        const associatedData = response.records.map((item) => ({
          [item.key]: latestData.includes(item.value)
            ? item.value
            : "",
        }));

        const obj = Object.assign({}, ...associatedData);
        setSelectedAssociations(obj);
      } catch (error) {
        console.error("Error fetching template:", error);
      }
    };

    fetchTemplate();
  }, [isOpen, templateId, selectedCoordinates]);

  const handleCsvHeaderChange = (csvHeader, value) => {
    setSelectedAssociations((prev) => {
      const updated = { ...prev, [csvHeader]: value };

      csvHeaders.forEach((header) => {
        if (!(header in updated)) updated[header] = "";
      });

      return updated;
    });
  };

  const handleTemplateHeaderChange = (csvHeader, templateHeader) => {
    setSelectedAssociations((prev) => {
      const updated = { ...prev };

      if (templateHeader.includes("--")) {
        const [min, max] = templateHeader.split("--").map(Number);

        Object.keys(updated).forEach((header) => {
          const questionNumber = parseInt(header.replace(/\D/g, ""), 10);

          if (
            !isNaN(questionNumber) &&
            questionNumber >= min &&
            questionNumber <= max
          ) {
            updated[header] = templateHeader;
          }
        });
      } else if (templateHeader === "UserFieldName") {
        updated[csvHeader] = "";
      } else {
        updated[csvHeader] = templateHeader;
      }

      csvHeaders.forEach((header) => {
        if (!(header in updated)) updated[header] = "";
      });

      return updated;
    });
  };

  const onMapSubmitHandler = async () => {
    const mappedValues = Object.values(selectedAssociations);

    for (let i = 1; i <= templateHeaders.length; i++) {
      if (!mappedValues.includes(`Image${i}`)) {
        toast.error("Please select all fields properly.");
        return;
      }
    }

    setSubmitLoading(true);

    const associationData = csvHeaders.map((header) => ({
      key: header,
      value: selectedAssociations[header] || "",
    }));

    const mappedData = {
      mappedData: associationData,
      templateId,
    };

    try {
      const response = await submitMappedData(mappedData);

      if (response.success) {
        toast.success("Mapping successfully done.");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content p-3">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h1 className="text-primary fs-2">Mapping</h1>
            <button
              onClick={onClose}
              className="btn btn-link text-danger fs-4 fw-bold"
            >
              X
            </button>
          </div>

          {/* BODY */}
          <HeaderData
            csvHeaders={csvHeaders}
            prevValue={prevValue}
            handleTemplateHeaderChange={handleTemplateHeaderChange}
            templateHeaders={templateHeaders}
            selectedAssociations={selectedAssociations}
            handleCsvHeaderChange={handleCsvHeaderChange}
          />

          <HeaderMappedReview
            onMapSubmitHandler={onMapSubmitHandler}
            setShowModal={setShowModal}
            showModal={showModal}
            selectedAssociations={selectedAssociations}
            submitLoading={submitLoading}
          />

        </div>
      </div>
    </div>
  );
};

export default EditMappedDataModel;