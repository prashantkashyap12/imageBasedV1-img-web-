import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchHeadersInDuplicate,
  onGetTemplateHandler,
  submitMappedData,
} from "../../services/common";
import HeaderData from "./HeaderData";
import HeaderMappedReview from "./HeaderMappedReview";

const TemplateMapping = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [templateHeaders, setTemplateHeaders] = useState([]);
  const [selectedAssociations, setSelectedAssociations] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { id } = useParams();

  const navigate = useNavigate();
  let fileId = JSON.parse(localStorage.getItem("templeteId")) || "";
  let token = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const templateData = response?.find((data) => data.id == id);
        for (let i = 1; i <= templateData.pageCount; i++) {
          templateData.templetedata.push({ attribute: `Image${i}` });
        }

        const selctedCoordinates = templateData.templetedata.map((item) => {
          return item.attribute;
        });
        console.log(selctedCoordinates);
        // templateData.templetedata.push({ attribute: "Image" });
        setTemplateHeaders(selctedCoordinates);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, [id]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("fileId"));
    async function fetchData() {
      const response = await fetchHeadersInDuplicate(data.templeteId);
      setCsvHeaders(response.headers);
    }
    fetchData();
  }, []);

  const handleCsvHeaderChange = (csvHeader, index) => {
    const updatedAssociations = { ...selectedAssociations };
    updatedAssociations[csvHeader] = index;
    setSelectedAssociations(updatedAssociations);

    csvHeaders.forEach((header) => {
      if (!(header in updatedAssociations)) {
        updatedAssociations[header] = "";
      }
    });

    setSelectedAssociations(updatedAssociations);
  };

  const handleTemplateHeaderChange = (csvHeader, templateHeader) => {
    const updatedAssociations = { ...selectedAssociations };

    if (templateHeader.includes("--")) {
      const [min, max] = templateHeader.split("--");
      const newMin = parseInt(min);
      const newMax = parseInt(max);
      // Loop through all headers

      Object.keys(selectedAssociations).forEach((header) => {
        const questionNumber = parseInt(header.replace(/\D/g, ""));
        if (questionNumber >= newMin && questionNumber <= newMax) {
          updatedAssociations[header] = templateHeader;
        }
      });
    } else if (templateHeader === "UserFieldName") {
      updatedAssociations[csvHeader] = "";
    } else {
      updatedAssociations[csvHeader] = templateHeader;
    }
    // Ensure all headers are included in updatedAssociations
    csvHeaders.forEach((header) => {
      if (!(header in updatedAssociations)) {
        updatedAssociations[header] = "";
      }
    });

    setSelectedAssociations(updatedAssociations);
  };

  const onMapSubmitHandler = async () => {
    const mappedvalues = Object.values(selectedAssociations);

    for (let i = 1; i <= templateHeaders.pageCount; i++) {
      if (!mappedvalues.includes(`Image${i}`)) {
        toast.error("Please select all the field properly.");
        return;
      }
    }
    setSubmitLoading(true);
    const associationData = [];
    const obj = { ...selectedAssociations };
    for (let i = 0; i < csvHeaders.length; i++) {
      const header = csvHeaders[i];
      if (obj.hasOwnProperty(header)) {
        associationData.push({
          key: header,
          value: obj[header],
        });
      }
    }

    const mappedData = {
      mappedData: associationData,
      templateId: fileId,
    };

    try {
      // console.log(mappedData)
      // return
      const response = await submitMappedData(mappedData);
      if (response.success) {
        toast.success("Mapping successfully done.");
        navigate(`/admin/csvuploader/fieldDecision/${id}`);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

 return (
  <div
    className="d-flex justify-content-center align-items-center w-100"
    style={{
      minHeight: "100vh",
      background: "linear-gradient(to right, #60a5fa, #2563eb)",
      paddingTop: "80px",
      paddingBottom: "40px",
    }}
  >
    <div
      className="card shadow-lg border-0 w-100"
      style={{ maxWidth: "900px", borderRadius: "12px" }}
    >
      <div className="card-body p-4">

        {/* HEADER */}
        <h1 className="text-center text-primary fw-bold mb-4">
          Mapping
        </h1>

        {/* HEADER DATA SECTION */}
        <div className="mb-4">
          <HeaderData
            csvHeaders={csvHeaders}
            handleTemplateHeaderChange={handleTemplateHeaderChange}
            templateHeaders={templateHeaders}
            selectedAssociations={selectedAssociations}
            handleCsvHeaderChange={handleCsvHeaderChange}
          />
        </div>

        {/* REVIEW + SUBMIT */}
        <div className="mt-3">
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
  </div>
);
};
export default TemplateMapping;
