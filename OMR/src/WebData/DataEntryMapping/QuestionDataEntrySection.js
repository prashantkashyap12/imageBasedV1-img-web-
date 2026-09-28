import { useEffect, useState, useRef } from "react";
import {
  changeTaskStatus,
  dataEntryMetaData,
  onGetTemplateHandler,
} from "../services/common";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
const QuestionDataEntrySection = ({
  data,
  setImageData,
  saveHandler,
  setEditedData,
  inputRefs,
  inputIndexRef,
  invalidIndex,
  settemplateData,
  formData,
  loadingData,
  lastKey,
}) => {
  const [questionData, setQuestionData] = useState([]);
  const taskData = JSON.parse(localStorage.getItem("taskdata"));
  const [columnName, setColumnName] = useState("");
  const [editableData, setEditableData] = useState(null);
  const [templateHeader, settemplateHeader] = useState([]);
  // const lastKey = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    console.log(data);
    setEditableData(data?.questionData);
    setEditedData([]);
  }, [data]);
  console.log({
    data: data,
    setImageData: setImageData,
    saveHandler: saveHandler,
    setEditedData: setEditedData,
    taskData: taskData,
  });

  function throttle(func, delay) {
    let lastCall = 0;

    return function (...args) {
      const now = Date.now();

      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  //debouncing

  function debounce(func, delay) {
    let timer;

    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();

        settemplateHeader(
          response.filter((a) => a.id === parseInt(taskData.templeteId)),
        );
        settemplateData(
          response.filter((a) => a.id === parseInt(taskData.templeteId)),
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, []);
  // console.log(templateHeader[0]);
  const allowedOptions = templateHeader[0]?.typeOption?.split("-") || [];
  allowedOptions.push(templateHeader[0]?.blankDefination);
  allowedOptions.push(templateHeader[0]?.patternDefinition);
  // console.log(parseInt(taskData.templeteId))
  const debouncedSave = debounce(() => saveHandler(editableData), 100);

  const handleInputChange = (key, newValue) => {
    // ✅ Remove any character not in the allowed list
    const filteredValue = newValue
      .toUpperCase() // optional: make case-insensitive
      .split("") // split into individual chars
      .filter((char) => allowedOptions.includes(char))
      .join("");

    setEditableData((prevData) => ({
      ...prevData,
      [key]: filteredValue, // ✅ only allowed chars are stored
    }));

    setEditedData((prev) => {
      const updatedData = [...prev];
      const existingIndex = updatedData.findIndex(
        (item) => Object.keys(item)[0] === key,
      );

      if (existingIndex !== -1) {
        updatedData[existingIndex] = { [key]: filteredValue };
      } else {
        updatedData.push({ [key]: filteredValue });
      }

      return updatedData;
    });
  };

  useEffect(() => {
    if (columnName !== "") {
      const fetchData = async () => {
        try {
          const response = await dataEntryMetaData(
            taskData.templeteId,
            columnName,
          );
          const data = response.data;
          console.log(data);
          setImageData(data[0]);
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
      //  const res =  getMetaDataHandler();
    }
  }, [columnName]);

  const submitHandler = async () => {
    const result = window.confirm("Are you sure you want to submit the task?");
    if (!result) {
      return; // Exit the function if the user cancels
    }
    try {
      const taskData = localStorage.getItem("taskdata");
      if (taskData) {
        const parsedData = JSON.parse(taskData);
        const taskId = parsedData.id;
        const res = await changeTaskStatus(taskId);
        if (!res) {
          toast.error("Error in submitting task");
        } else {
          navigate("/admin/datamatching", { replace: true });
          toast.success("Task submitted successfully");
        }
      }
    } catch (error) {
      console.error("Error in submitting task:", error);
      toast.error("Error in submitting task");
    } finally {
      // Reset any necessary state or perform cleanup here
    }
  };

  const keyBlockedRef = useRef(false);

  useEffect(() => {
    const handleAltSKey = (e) => {
      if (loadingData) return; // Prevent save during data loading

      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();

        if (keyBlockedRef.current) return; // Throttle repeated trigger
        keyBlockedRef.current = true;

        saveHandler(editableData);

        setTimeout(() => {
          keyBlockedRef.current = false;
        }, 200);
      }
    };

    document.addEventListener("keydown", handleAltSKey);
    return () => {
      document.removeEventListener("keydown", handleAltSKey);
    };
  }, [editableData, saveHandler, loadingData]);

  console.log(editableData);
  return (
    <div className="w-100 px-3 px-xl-4 mx-auto text-white" style={{maxWidth:"1400px"}}>
      <div className="my-3 w-100">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center">
          <label className="h5 fw-semibold ms-2 mb-0">Questions:</label>

          <div>
            <button
              onClick={debouncedSave}
              className="btn btn-warning fw-bold mr-6"
              id="update"
            >
              Save
            </button>

            {data.total_error === data.currentIndex && (
              <button
                onClick={submitHandler}
                className="btn btn-success fw-bold me-4"
              >
                Submit Task
              </button>
            )}
          </div>
        </div>

        {/* Inputs Container */}
        <div
          className="d-flex flex-wrap overflow-auto mt-3 ms-2"
          style={{ maxHeight: "360px" }}
        >
          {editableData ? (
            Object.entries(editableData).map(([key, value], index) => {
              const red = value === " " || value === "*" || value === "";

              return (
                <div key={index} className="d-flex me-2 mb-2 " style={{width:"120px"}}>
                  <div className="d-flex align-items-center">
                    {/* Label */}
                    <label
                      className="fw-bold small me-2"
                      style={{ width: "30px", color:"black" }}
                    >
                      {key}
                    </label>

                    {/* Input */}
                    <input
                      type="text"
                      ref={(el) => {
                        if (red) {
                          inputRefs.current[key] = el;
                        } else {
                          delete inputRefs.current[key];
                        }
                      }}
                      value={value}
                      className={`form-control form-control-sm text-center ${
                        red ? "bg-danger text-white" : ""
                      }`}
                      style={{ width: "35px", height: "30px" }}
                      onChange={(e) => {
                        const char = e.target.value.slice(0, 1);
                        if (
                          allowedOptions.includes(char.toUpperCase()) ||
                          char === " " ||
                          char === ""
                        ) {
                          handleInputChange(
                            key,
                            char === " " ? " " : char.toUpperCase(),
                          );
                        }
                      }}
                      onClick={() => {
                        setColumnName(key);

                        const invalidKeys = Object.keys(inputRefs.current);

                        const sortedData = [...invalidKeys].sort((a, b) => {
                          const isAAlphaOnly = /^[A-Za-z]+$/.test(a);
                          const isBAlphaOnly = /^[A-Za-z]+$/.test(b);

                          if (isAAlphaOnly && !isBAlphaOnly) return -1;
                          if (!isAAlphaOnly && isBAlphaOnly) return 1;

                          if (isAAlphaOnly && isBAlphaOnly)
                            return a.localeCompare(b);

                          const prefixA = a.match(/[A-Za-z]+/)[0];
                          const prefixB = b.match(/[A-Za-z]+/)[0];

                          if (prefixA !== prefixB)
                            return prefixA.localeCompare(prefixB);

                          const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
                          const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);

                          return numA - numB;
                        });

                        const currentIndex = sortedData.indexOf(key);

                        if (currentIndex !== -1) {
                          lastKey.current = key;
                        }
                      }}
                      onFocus={() => {
                        setColumnName(key);
                      }}
                      onKeyDown={(e) => {
                        const rawKey = e.key;
                        const keyUpper = rawKey.toUpperCase();

                        if (
                          rawKey.length === 1 &&
                          !allowedOptions.includes(keyUpper) &&
                          rawKey !== " "
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : questionData.length === 0 ? (
            <div>No Data Found</div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDataEntrySection;
