import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onGetTemplateHandler } from "../../services/common";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormField from "./FormField";
import QuestionField from "./QuestionField";
import CheckedDataConfirmation from "./CheckedDataConfirmation";
import API_NODE from "WebData/apiNode/apiNode";

const FieldDecision = () => {
  const [checkedData, setCheckedData] = useState(null);
  const [formFields, setFormField] = useState([]);
  const [questionsField, setQuestionsField] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  let token = JSON.parse(localStorage.getItem("userData"));
  let { fileId } = JSON.parse(localStorage.getItem("fileId")) || "";

  useEffect(() => {
    const fetchMappedData = async () => {
      try {
        const template = await onGetTemplateHandler();
        const response = await API_NODE.get(
          `${window.SERVER_IP}/get/mappeddata/${id}`,
          {
            headers: {
              token: token,
            },
          },
        );
        const selectedTemplate = template.find((data) => data.id == id);

        // Initialize arrays to hold the separated fields
        const formField = {};
        const questionsFields = [];

        // Iterate over templateHeaders and categorize based on typeField
        Object.entries({ ...response?.data }).map(([key, value], i) => {
          const templateData = selectedTemplate?.templetedata?.find((data) => {
            if (data.attribute === value && data.fieldType === "formField") {
              formField[i] = key;
            }
          });
        });

        Object.entries({ ...response?.data }).map(([key, value], i) => {
          const templateData = selectedTemplate?.templetedata?.find((data) => {
            if (
              data.attribute === value &&
              data.fieldType === "questionsField"
            ) {
              questionsFields[i] = key;
            }
          });
        });

        let transformedData = {};

        for (let key in response?.data) {
          transformedData[key] = {
            value: response?.data[key],
            legal: false,
            blank: false,
            pattern: false,
          };
        }

        setCheckedData(transformedData);

        setFormField(formField);
        setQuestionsField(questionsFields);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchMappedData();
  }, []);

  const onCheckBoxHandler = (key, pattern) => {
    const obj = { ...checkedData };
    if (pattern === "Legal") {
      obj[key].legal = !obj[key].legal;
    } else if (pattern === "Pattern") {
      obj[key].pattern = !obj[key].pattern;
    } else if (pattern === "Blank") {
      obj[key].blank = !obj[key].blank;
    }

    setCheckedData(obj);
  };

  const setAllProperties = (key, fieldType) => {
    const updatedData = { ...checkedData };

    if (fieldType === "formField") {
      const formDataArr = Object.values(formFields);
      for (let data in updatedData) {
        if (formDataArr?.includes(data)) {
          updatedData[data][key] = !updatedData[data][key];
        }
      }
    } else if (fieldType === "questionsField") {
      const questionDataArr = questionsField;
      for (let data in updatedData) {
        if (questionDataArr.includes(data)) {
          updatedData[data][key] = !updatedData[data][key];
        }
      }
    }

    setCheckedData(updatedData);
  };

  const onChekedDataHandler = async () => {
    setLoading(true);
    try {
      await API_NODE.post(
        `${window.SERVER_IP}/formcheckeddata`,
        { formCheckedData: checkedData, fileID: fileId },
        // {
        //   headers: {
        //     token: token,
        //   },
        // },
      );
      setLoading(false);
      toast.success("Check Data added successfully.");
      navigate(`/admin/csvuploader/taskAssign/${id}, {replace: true}`);
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
  <div
    className="d-flex flex-column justify-content-center py-4"
    style={{
      minHeight: "100vh",
      // background: "linear-gradient(to right, #60a5fa, #2563eb)",
    }}
  >
    <div className="container">

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h1 className="h4 fw-semibold  mb-0">
          Field Decision
        </h1>

        <button
          onClick={() => setConfirmModal(true)}
          className="btn btn-success px-4"
        >
          Save
        </button>
      </div>

      {/* Form Fields Section */}
      <FormField
        setAllProperties={setAllProperties}
        formFields={formFields}
        checkedData={checkedData}
        onCheckBoxHandler={onCheckBoxHandler}
      />

      {/* Questions Section */}
      <QuestionField
        setAllProperties={setAllProperties}
        questionsField={questionsField}
        checkedData={checkedData}
        onCheckBoxHandler={onCheckBoxHandler}
      />

      {/* Confirmation Modal */}
      <CheckedDataConfirmation
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        onChekedDataHandler={onChekedDataHandler}
        loading={loading}
      />

    </div>
  </div>
);
};

export default FieldDecision;
