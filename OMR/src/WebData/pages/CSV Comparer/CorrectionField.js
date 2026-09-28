import React, { useState, useEffect, useRef } from "react";
import {
  fetchTemplateFormData,
} from "../../services/common";
import { toast } from "react-toastify";
import Loader from "../../UI/Loader";
import API_NODE from "WebData/apiNode/apiNode";

const CorrectionField = ({
  subData,
  currentData,
  taskId,
  nextHandler,
  imageFocusHandler,
}) => {
  const taskData = JSON.parse(localStorage.getItem("taskdata"));
  const token = JSON.parse(localStorage.getItem("userData"));
  const [visitedCount, setVisitedCount] = useState(0);
  const [visitedRows, setVisitedRows] = useState({}); // Track visited rows
  const [dataRow, setDataRow] = useState(currentData);
  const [inputValue, setInputValue] = useState({});
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedeData, setUpdatedData] = useState([]);
  const isUpdatingRef = useRef(false);



  useEffect(() => {
    setDataRow(currentData);
    setInputValue({});
  }, [currentData]);
  useEffect(() => {
    setVisitedCount(0);
    setVisitedRows({});
  }, [currentData]);

  const handleVisit = (index) => {
    if (!visitedRows[index]) {
      setVisitedRows((prev) => ({ ...prev, [index]: true }));
      setVisitedCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const processTemplateData = async () => {
      try {
        if (!taskData?.templeteId || subData.length === 0) return;

        const templateId = taskData.templeteId;

        // Fetch form field data for each COLUMN_NAME in parallel
        const updatedData = await Promise.all(
          subData.map(async (item) => {
            try {
              console.log(item);
              const isFormField = await fetchTemplateFormData(
                templateId,
                item.Column_Name,
              );
              const type = isFormField?.templateData?.fieldType || "formField"; // Use default "formField" if API fails or returns undefined
              return { ...item, type };
            } catch (error) {
              console.error(
                `Error fetching data for ${item.Column_Name}:`,
                error,
              );
              return { ...item, type: "formField" }; // Fallback to "formField"
            }
          }),
        );

        console.log(updatedData)

        setUpdatedData(updatedData);
      } catch (error) {
        console.error("Error processing template data:", error);
      }
    };

    processTemplateData();
  }, [dataRow, currentData]);

  useEffect(() => {
    setVisitedCount(0);
    setVisitedRows({});
  }, []);

  useEffect(() => {
    const handleAltSKey = (e) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault(); // Prevents browser shortcuts (if any)
        document.getElementById("update").click();
      }
    };

    document.addEventListener("keydown", handleAltSKey);
    return () => document.removeEventListener("keydown", handleAltSKey);
  }, []);
  useEffect(() => {
    handleVisit(0);
  }, []);

  useEffect(() => {
    return () => setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleTabKey = (e) => {
      if (e.key === "Tab") {
        e.preventDefault(); // Prevent default tab behavior

        const focusableInputs = inputRefs.current.filter((el) => el);
        const currentIndex = focusableInputs.indexOf(document.activeElement);

        if (e.shiftKey) {
          // Shift + Tab (Move Backward)
          const prevIndex =
            (currentIndex - 1 + focusableInputs.length) %
            focusableInputs.length;
          focusableInputs[prevIndex]?.focus();
        } else {
          // Tab (Move Forward)
          const nextIndex = (currentIndex + 1) % focusableInputs.length;
          focusableInputs[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, []);

  const handleInputChange = (e, key) => {
    setInputValue((prevValues) => ({
      ...prevValues,
      [key]: e.target.value,
    }));
  };

  const onUpdateHandler = async () => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;
    setIsLoading(true);

    try {
      const mappedData = subData.map((dataItem) => {
        return {
          id: dataItem.id,
          Column_Name: dataItem.Column_Name,
          Corrected: inputValue[dataItem.Column_Name],
        };
      });
      const filtered = mappedData.filter((item) => item.Corrected != null);

      const obj = {
        updated: filtered,
        parentId: currentData?.parentId,
        taskId: taskId,
        errorDataId: currentData.id,
      };

      const response = await API_NODE.post(
        `${window.SERVER_IP}/csvUpdateData/${taskId}/batch`,
        obj,
      );
      if (response.data.success) {
        toast.success("Corrected Value Updated Successfully");
        nextHandler();
      }
    } catch (error) {
      console.error(
        "Error updating data:",
        error?.response?.data?.message || error,
      );
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
      isUpdatingRef.current = false;
    }
  };

  const errorData = updatedeData?.map((dataItem, index) => {
    const key = `${dataItem?.Column_Name?.trim()}`;
    // const updatedValue = dataItem.CORRECTED||"Null";
    const questionAllowedValues = ["A", "B", "C", "D", "*", " "];
    // const formAllowed = //allvalues
    const numberRegex = /^[0-9]*$/; // Allows only numbers (0-9)
    const allowedValues = dataItem.type === "formField" ? questionAllowedValues : "questionsField";

    // console.log(dataItem)

  return (
  <tr
    key={index}
    className={`align-middle ${
      visitedRows[index] ? "table-success" : "table-danger"
    }`}
    style={{ transition: "all 0.2s ease" }}
  >
    {/* PRIMARY */}
    <td className="py-3 fw-medium text-dark">
      {dataRow?.Primary}
    </td>

    {/* FIELD NAME */}
    <td className="py-3 text-muted fw-semibold">
      {dataItem?.Column_Name}
    </td>

    {/* FILE 1 */}
    <td
      className="py-3 text-truncate"
      style={{
        maxWidth: "180px",
        minWidth: "180px",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
      title={dataItem?.File_1_data}
    >
      {dataItem?.File_1_data || "-"}
    </td>

    {/* FILE 2 */}
    <td
      className="py-3 text-truncate"
      style={{
        maxWidth: "180px",
        minWidth: "180px",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
      title={dataItem?.File_2_data}
    >
      {dataItem?.File_2_data || "-"}
    </td>

    {/* INPUT */}
    <td className="py-2">
      <input
        type="text"
        className="form-control text-center rounded-3 shadow-sm border-1"
        style={{
          maxWidth: "140px",
          margin: "0 auto",
          fontWeight: "500",
        }}
        value={
          inputValue[key] !== undefined
            ? inputValue[key]
            : dataItem?.Corrected
            ? dataItem?.Corrected
            : ""
        }
        placeholder={dataItem?.Column_Name}
        onChange={(e) => {
          const input = e.target.value.toUpperCase();

          if (
            (dataItem.type === "formField" && numberRegex.test(input)) ||
            (dataItem.type !== "formField" &&
              (input === "" || questionAllowedValues.includes(input)))
          ) {
            handleInputChange(
              { ...e, target: { ...e.target, value: input } },
              key
            );
          }
        }}
        onFocus={() => {
          imageFocusHandler(dataItem?.Column_Name);
          handleVisit(index);
        }}
        ref={(el) => (inputRefs.current[index] = el)}
        maxLength={dataItem.type !== "formField" && 1}
      />
    </td>
  </tr>
);
  });

return (
  <div className="container-fluid d-flex justify-content-center mt-4 px-3">
    <div
      className="bg-white rounded-4 shadow-sm p-4"
      style={{ width: "100%", maxWidth: "1200px" }}
    >
      {/* HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">

        {/* LEFT - PRIMARY KEY */}
        <div>
          <div className="text-muted small mb-1">Primary Key</div>
          <h5 className="fw-bold mb-0 text-dark">
            {currentData?.Primary_Key || "-"}
          </h5>
        </div>

        {/* CENTER - STATS */}
        <div className="d-flex flex-wrap align-items-center gap-2">

          <div className="px-3 py-2 rounded-pill bg-danger-subtle text-danger fw-medium small">
            Errors: {subData?.length}
          </div>

          <div className="px-3 py-2 rounded-pill bg-info-subtle text-info fw-medium small">
            Visited: {visitedCount}
          </div>

          {subData?.length === visitedCount ? (
            <div className="px-3 py-2 rounded-pill bg-success-subtle text-success fw-medium small">
              All Visited
            </div>
          ) : (
            <div className="px-3 py-2 rounded-pill bg-warning-subtle text-warning fw-medium small">
              Pending: {subData?.length - visitedCount}
            </div>
          )}
        </div>

        {/* RIGHT - ACTION */}
        <button
          className="btn btn-success px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
          style={{ height: "42px", borderRadius: "12px", minWidth: "110px" }}
          disabled={isLoading}
          onClick={onUpdateHandler}
          id="update"
        >
          {isLoading ? <Loader /> : "Update"}
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="border rounded-4 overflow-hidden">

        <div
          className="table-responsive"
          style={{ maxHeight: "420px", overflowY: "auto" }}
        >
          <table className="table align-middle text-center mb-0">

            {/* HEADER */}
            <thead
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "#f8f9fa",
              }}
            >
              <tr className="text-muted small text-uppercase">
                <th className="fw-semibold py-3">
                  {currentData?.Primary_Key}
                </th>
                <th className="fw-semibold">Field Name</th>
                <th className="fw-semibold">File 1</th>
                <th className="fw-semibold">File 2</th>
                <th className="fw-semibold text-success">
                  Corrected Data
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="bg-white">{errorData}</tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};

export default CorrectionField;
