import React, { useEffect, useState } from "react";
import { dataEntryMetaData } from "../services/common";

const FormDataEntrySection = ({
  formData,
  setImageData,
  setFormData,
  setEditedData,
  inputRefs,
  imageData,
  editedData,
  templateData,
  setInvalidMap,
  invalidMap,
}) => {
  const [columnName, setColumnName] = useState("");
  const taskData = JSON.parse(localStorage.getItem("taskdata"));

  useEffect(() => {
    if (columnName !== "") {
      const fetchData = async () => {
        try {
          const response = await dataEntryMetaData(
            taskData.templeteId,
            columnName,
          );
          const data = response.data;
          setImageData(data[0]);
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
      //  const res =  getMetaDataHandler();
    }
  }, [columnName]);
  //  console.log(invalidMap)
  const handleInputChange = (key, newValue) => {
    console.log(newValue);
    console.log(key);

    // previous value from formData (fallback to empty string)
    const prevValue = (formData && formData[0] && formData[0][key]) || "";

    const isDeletion = newValue.length < prevValue.length;

    const patternDef = templateData?.[0]?.patternDefinition ?? "";
    const blankDef = templateData?.[0]?.blankDefination ?? "";
    const blank = blankDef === "space" ? " " : blankDef;
    // If it's an addition (not deletion), enforce forbidden rules.
    console.log(blank);
    if (newValue.includes(patternDef) || newValue.includes(patternDef)) {
      setInvalidMap((prev) => ({ ...prev, [key]: true }));
    } else {
      setInvalidMap((prev) => ({ ...prev, [key]: false }));
    }
    if (!isDeletion) {
      // block if pattern not allowed and newValue contains the pattern
      if (!imageData.pattern && patternDef && newValue.includes(patternDef)) {
        return;
      }

      // block if blank not allowed and newValue contains blankDef
      if (!imageData.blank && blank && newValue.includes(blank)) {
        return;
      }

      // block empty only when user tries to set empty by typing (rare) or pasting.
      // Note: we still allow deletion to empty so backspace works — but you can change this behavior if you want.
      if (!imageData.empty && newValue.trim() === "") {
        // Option A (recommended UX): allow deletion but mark invalid
        // return; // <-- Uncomment this line to block typing into empty if you prefer
        // Example: set an error state instead and allow the UI to handle it
        // setErrorForKey(key, "Field cannot be empty");
        // We will allow deletion so backspace works.
      }
    }

    // Passed validation — update editedData
    setEditedData((prev) => {
      const updatedData = [...prev];
      const existingIndex = updatedData.findIndex(
        (item) => Object.keys(item)[0] === key,
      );

      if (existingIndex !== -1) {
        // If key exists, update its value
        updatedData[existingIndex] = { [key]: newValue };
      } else {
        // If key does not exist, add a new entry
        updatedData.push({ [key]: newValue });
      }

      console.log(updatedData);
      return updatedData;
    });
    // console.log(editedData)
    // Update formData[0][key]
    setFormData((prevData) => {
      const updatedData = [...prevData];
      if (updatedData[0]) {
        updatedData[0] = { ...updatedData[0], [key]: newValue };
      } else {
        // If no data yet, create initial object
        updatedData[0] = { [key]: newValue };
      }
      return updatedData;
    });
  };
  console.log(formData);

 return (
  <div className="border-end" style={{ minWidth: "240px" }}>
    <div>
      <article
        style={{ scrollbarWidth: "thin", height: "80vh" }}
        className="py-4 mt-3 mt-lg-5 shadow mx-auto rounded d-flex flex-row flex-lg-column align-items-lg-center w-95 bg-primary"
      >
        {Array.isArray(formData) && formData.length > 0 && formData[0] ? (
          Object.entries(formData[0]).map(([key, value], index) => (
            <div
              key={index}
              className="w-100 px-3 py-2 fw-bold d-flex flex-column align-items-center"
              style={{ maxWidth: "90%" }}
            >
              <label className="w-100 rounded fw-semibold py-2 shadow-sm text-center">
                <span className="small text-white fw-bold d-flex justify-content-center">
                  {key}
                </span>
              </label>

              <input
                ref={(el) => {
                  if (
                    value === " " ||
                    value === "*" ||
                    value.includes("*") ||
                    value.includes(templateData?.[0]?.patternDefinition) ||
                    value.includes(templateData?.[0]?.blankDefination)
                  ) {
                    inputRefs.current[key] = el;
                  } else {
                    delete inputRefs.current[key];
                  }
                }}
                type="text"
                value={value || ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className={`form-control text-center mt-2 ${
                  value.includes(templateData?.[0]?.patternDefinition) ||
                  value.includes(templateData?.[0]?.blankDefination)
                    ? "bg-danger text-white"
                    : ""
                }`}
                style={{ width: "200px", border: "none" }}
                onFocus={() => setColumnName(key)}
              />
            </div>
          ))
        ) : formData.length <= 0 ? (
          <div className="text-white">No Data Found</div>
        ) : (
          <div className="text-white">Loading..</div>
        )}
      </article>
    </div>
  </div>
);
};

export default FormDataEntrySection;
