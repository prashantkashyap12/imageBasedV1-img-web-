import React, { useEffect, useRef, useState } from "react";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  dataEntryMetaData,
  getRowCsvData,
  onGetTemplateHandler,
  updateCurrIndexData,
} from "../../services/common";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import CSVFormDataSection from "./CSVFormDataSection";
import CorrectionField from "./CorrectionField";
import ImageSectionCSV from "./IamgeSectionCSV";
import ButtonCsvSection from "./ButtonCsvSection";
import API_NODE from "WebData/apiNode/apiNode";

const UserCorrectionData = () => {
  const [popUp, setPopUp] = useState(false);
  const [templateHeaders, setTemplateHeaders] = useState(null);
  const [csvCurrentData, setCsvCurrentData] = useState([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTaskData, setCurrentTaskData] = useState(
    JSON.parse(localStorage.getItem("taskdata")) || null
  );
  const [selectedCoordintes, setSelectedCoordinates] = useState(false);
  const [modifiedKeys, setModifiedKeys] = useState({});
  const [imageNotFound, setImageNotFound] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [currIndex, setCurrIndex] = useState(1);
  const [currentData, setCurrentData] = useState(null);
  const [subData, setSubData] = useState(null);
  const [maximum, setMaximum] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(
    JSON.parse(localStorage.getItem("taskdata")).currentIndex
  );
  const [headerData, setHeaderData] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState();
  const location = useLocation();
  const token = JSON.parse(localStorage.getItem("userData"));
  const [header, setHeader] = useState(null);
  const [formData, setFormData] = useState(null);
  const [taskId, setTaskId] = useState(
    location.state !== null
      ? location.state.id
      : JSON.parse(localStorage.getItem("taskdata")).id
  );
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const task = JSON.parse(localStorage.getItem("taskdata"));
  const navigate = useNavigate();

  console.log(currentData);
  console.log(subData);

//  useEffect(() => {
//   const enableFullscreen = () => {
//     const element = document.documentElement;

//     if (!document.fullscreenElement) {
//       element.requestFullscreen().catch(() => {});
//     }
//   };

//   const handleVisibilityChange = () => {
//     if (document.visibilityState === "visible") {
//       enableFullscreen(); // ✅ This will work AFTER user interaction
//     }
//   };

//   // ✅ Trigger fullscreen only once on first user click
//   const handleFirstInteraction = () => {
//     enableFullscreen();
//     document.removeEventListener("click", handleFirstInteraction);
//   };

//   document.addEventListener("click", handleFirstInteraction);

//   // ✅ Keep your logic
//   document.addEventListener("visibilitychange", handleVisibilityChange);

//   return () => {
//     document.removeEventListener("visibilitychange", handleVisibilityChange);
//     document.removeEventListener("click", handleFirstInteraction);
//   };
// }, [currentData]);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "ArrowLeft") {
        prevHandler();
      }
      if (event.ctrlKey && event.key === "ArrowRight") {
        nextHandler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();

        const templateData = response.find(
          (data) => data.id === parseInt(currentTaskData.templeteId)
        );

        setTemplateHeaders(templateData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, [currentTaskData]);


  useEffect(() => {
    const req = async (taskId, rowId) => {
      const response = await getRowCsvData(taskId, rowId);
      if (response?.data) {
        setFormData(response.data);
        setImageUrls(response.imageUrl);
      }
    };
    if (currentData) {
      req(taskId, currentData?.parentId);
    }
  }, [currentData, currIndex]);

  useEffect(() => {
    setLoading(true);
    const req = async () => {
      const response = await API_NODE.post(
        `${window.SERVER_IP}/getCompareCsvData/${taskId}`,
        { currentIndex },
      );

      console.log(response)
      setCurrentData(response?.data?.mainData);
      setSubData(response?.data?.subData);
      setTotalData(response?.data?.errorCount);
      setCurrIndex(response?.data?.currentIndex);
    };
    req();
  }, [currentIndex, currIndex]);

  const changeCurrentCsvDataHandler = (key, newValue) => {
    if (!imageNotFound) {
      return;
    }

    const csvDataKeys = Object.keys(headerData[0]);
    let matchedValue = null;

    for (const dataKey of csvDataKeys) {
      if (dataKey === key) {
        matchedValue = headerData[0][key];
        break;
      }
    }
    const matchedCoordinate = templateHeaders?.templetedata?.find(
      (data) => data.attribute === matchedValue
    );

    setCsvCurrentData((prevData) => {
      const previousValue = prevData[key];
      if (matchedCoordinate?.fieldType === "questionsField") {
        if (templateHeaders.isPermittedToEdit) {
          const validCharacters = templateHeaders?.typeOption?.split("-");
          newValue = newValue.trim();

          if (validCharacters.includes(newValue) || newValue === "") {
            setModifiedKeys((prevKeys) => ({
              ...prevKeys,
              [key]: [newValue, previousValue],
            }));

            return {
              ...prevData,
              [key]: newValue,
            };
          } else {
            return prevData;
          }
        } else {
          toast.warning("You do not have permission to edit this field.");

          return {
            ...prevData,
            [key]: previousValue,
          };
        }
      } else {
        const csvHeader = headerData[0];
        const formData = templateHeaders?.templetedata?.filter(
          (data) => data.fieldType === "formField"
        );

        const currentFormData = formData.find(
          (data) => data.attribute === csvHeader[key]
        );

        if (!currentFormData) {
          return prevData;
        }

        const { dataFieldType, fieldLength } = currentFormData;
        if (dataFieldType === "number") {
          if (!/^[0-9]+$/.test(newValue)) {
            return {
              ...prevData,
              [key]: newValue ? previousValue : "",
            };
          } else if (newValue.length > +fieldLength) {
            return {
              ...prevData,
              [key]: previousValue,
            };
          } else {
            setModifiedKeys((prevKeys) => ({
              ...prevKeys,
              [key]: [newValue, previousValue],
            }));

            return {
              ...prevData,
              [key]: newValue,
            };
          }
        } else if (dataFieldType === "text") {
          if (!/^[a-zA-Z]+$/.test(newValue)) {
            return {
              ...prevData,
              [key]: newValue ? previousValue : "",
            };
          } else if (newValue.length > +fieldLength) {
            return {
              ...prevData,
              [key]: previousValue,
            };
          } else {
            setModifiedKeys((prevKeys) => ({
              ...prevKeys,
              [key]: [newValue, previousValue],
            }));

            return {
              ...prevData,
              [key]: newValue,
            };
          }
        } else if (dataFieldType === "alphanumeric") {
          if (!/^[a-zA-Z0-9]+$/.test(newValue)) {
            return {
              ...prevData,
              [key]: newValue ? previousValue : "",
            };
          } else if (newValue.length > +fieldLength) {
            return {
              ...prevData,
              [key]: previousValue,
            };
          } else {
            setModifiedKeys((prevKeys) => ({
              ...prevKeys,
              [key]: [newValue, previousValue],
            }));

            return {
              ...prevData,
              [key]: newValue,
            };
          }
        }
        setModifiedKeys((prevKeys) => ({
          ...prevKeys,
          [key]: [newValue, previousValue],
        }));

        return {
          ...prevData,
          [key]: newValue,
        };
      }
    });
  };
  // console.log(task.templeteId)

  // const imageFocusHandler = async (headerName) => {
  //   const res = await dataEntryMetaData(task.templeteId, headerName);
  //   if (!res) {
  //     toast.error("Header not found");
  //     return;
  //   }
  //   const coordinateData = res.data;

  //   const { coordinateX, coordinateY, width, height } = coordinateData[0];

  //   const containerWidth = imageContainerRef?.current?.offsetWidth;
  //   const containerHeight = imageContainerRef?.current?.offsetHeight;

  //   // Calculate the zoom level based on the container size and the selected area size
  //   // ✅ Calculate zoom
  // const calculatedZoom = Math.min(
  //   containerWidth / width,
  //   containerHeight / height
  // );

  // // ✅ Prevent zoom-out
  // const zoomLevel = Math.max(1, calculatedZoom);

  //   // Calculate the scroll position to center the selected area
  //   const scrollX =
  //     coordinateX * zoomLevel - containerWidth / 2 + (width / 2) * zoomLevel;
  //   const scrollY =
  //     coordinateY * zoomLevel - containerHeight / 2 + (height / 2) * zoomLevel;

  //   // Update the img element's style property to apply the zoom transformation
  //   imageRef.current.style.transform = `scale(${zoomLevel})`;
  //   imageRef.current.style.transformOrigin = `0 0`;

  //   // Scroll to the calculated position
  //   imageContainerRef.current.scrollTo({
  //     left: scrollX,
  //     top: scrollY,
  //     behavior: "smooth",
  //   });
  //   setSelectedCoordinates(true);
  // };


const imageFocusHandler = async (headerName) => {
  try {
    // ✅ Validate input
    if (!headerName) {
      toast.error("Invalid header name");
      return;
    }

    if (!task?.templeteId) {
      toast.error("Template ID missing");
      return;
    }

    // ✅ API Call
    const res = await dataEntryMetaData(task.templeteId, headerName);

    // ✅ Response validation
    if (!res || !res.data || !Array.isArray(res.data) || res.data.length === 0) {
      toast.error("Header not found");
      return;
    }

    const coordinateData = res.data[0];

    const { coordinateX, coordinateY, width, height } = coordinateData || {};

    // ✅ Validate coordinates
    if (
      coordinateX == null ||
      coordinateY == null ||
      !width ||
      !height
    ) {
      toast.error("Invalid coordinate data");
      return;
    }

    // ✅ DOM refs check
    if (!imageContainerRef?.current || !imageRef?.current) {
      toast.error("Image container not ready");
      return;
    }

    const containerWidth = imageContainerRef.current.offsetWidth;
    const containerHeight = imageContainerRef.current.offsetHeight;

    if (!containerWidth || !containerHeight) {
      toast.error("Container size not available");
      return;
    }

    // ✅ Calculate zoom safely
    const calculatedZoom = Math.min(
      containerWidth / width,
      containerHeight / height
    );

    const zoomLevel = Math.max(1, calculatedZoom);

    // ✅ Calculate scroll safely
    const scrollX =
      coordinateX * zoomLevel - containerWidth / 2 + (width / 2) * zoomLevel;

    const scrollY =
      coordinateY * zoomLevel - containerHeight / 2 + (height / 2) * zoomLevel;

    // ✅ Apply transform
    imageRef.current.style.transform = `scale(${zoomLevel})`;
    imageRef.current.style.transformOrigin = "0 0";

    // ✅ Scroll with boundary protection
    imageContainerRef.current.scrollTo({
      left: Math.max(0, scrollX),
      top: Math.max(0, scrollY),
      behavior: "smooth",
    });

    setSelectedCoordinates(true);

  } catch (error) {
    console.error("Image focus error:", error);

    // ✅ Friendly error messages
    if (error?.response?.status === 404) {
      toast.error("Header not found on server");
    } else if (error?.response?.status === 500) {
      toast.error("Server error, please try again");
    } else {
      toast.error("Something went wrong");
    }
  }
};



  const onCompleteHandler = async () => {
    try {
      const response = await axios.get(
        `${window.SERVER_IP}/download/correctedCsv/${taskId}`,
        {
          headers: {
            token: token,
          },
        }
      );

      await API_NODE.post(
        `${window.SERVER_IP}/taskupdation/${parseInt(
          currentTaskData?.id
        )}`,
        {
          taskStatus: true,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      setConfirmationModal(false);
      toast.success("task completed successfully.");
      navigate("/admin/datamatching");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const zoomInHandler = () => {
    setZoomLevel((prevZoomLevel) => Math.min(prevZoomLevel * 1.1, 3));
  };

  const zoomOutHandler = () => {
    setZoomLevel((prevZoomLevel) => Math.max(prevZoomLevel * 0.9, 0.5));
  };

  const onInialImageHandler = () => {
    setZoomLevel(1);
    setSelectedCoordinates(false);
    if (imageRef.current) {
      imageRef.current.style.transform = "none";
      imageRef.current.style.transformOrigin = "initial";
    }
  };

  const compareHandler = () => {
    // onImageHandler("initial", currentIndex - 1, filteredArray, currentTaskData);
    setPopUp(false);
  };
  const modalClose = () => {
    setPopUp(false);
    navigate("/admin/dataMatching");
  };
  const onTaskCompleteHandler = () => {
    setConfirmationModal(true);
  };
  const prevHandler = async () => {
    const response = await updateCurrIndexData(taskId, "prev");
    if (!response) {
      toast.error("Cannot go back. Already at the first index.");
      return;
    }
    setCurrIndex(response?.updatedIndex);
  };
  const nextHandler = async () => {
    const response = await updateCurrIndexData(taskId, "next");
    if (!response) {
      toast.error("Cannot proceed forward. Already at the last index.");
      return;
    }
    setCurrIndex(response?.updatedIndex);
  };
 return (
  <>
    {!popUp && (
      <div className="container-fluid p-5 dataEntry  min-vh-100 d-flex justify-content-center">

        <div className="row g-4">

          {/* LEFT SECTION */}
          {formData && (
            <div className="col-lg-3 ">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-white fw-bold fs-5 border-0">
                  CSV Data
                </div>
                <div className="card-body">
                  <CSVFormDataSection formCsvData={formData} />
                </div>
              </div>
            </div>
          )}

          {/* RIGHT SECTION */}
          <div className="col-lg-9">

            <div className="card shadow-sm border-0 rounded-4">

              {/* HEADER */}
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start">
                <h4 className="fw-bold mb-0">Image Matching Panel</h4>

                <div>
                  {Number(task.max) === currIndex && (
                    <button
                      onClick={onTaskCompleteHandler}
                      className="btn btn-success rounded-pill px-4"
                    >
                      Submit Task
                    </button>
                  )}

                  <button
                    onClick={() => navigate("/admin/datamatching")}
                    className="btn btn-outline-primary rounded-pill px-4"
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* BODY */}
              <div className="card-body">

                {!imageUrls?.length ? (
                  <div className="text-center py-5">
                    <ImageNotFound />
                    <h4 className="mt-4 fw-semibold text-muted">
                      Please Select Image
                    </h4>
                    <p className="text-muted">
                      No image available to display
                    </p>
                  </div>
                ) : (
                  <>
                    {/* TOP CONTROL BAR */}
                    <div className="mb-4">
                      <div className="card border-0 rounded-3 p-3">
                        <ButtonCsvSection
                          currentIndex={currIndex}
                          csvData={csvData}
                          currentData={currentData}
                          max={maximum}
                          zoomInHandler={zoomInHandler}
                          onInialImageHandler={onInialImageHandler}
                          zoomOutHandler={zoomOutHandler}
                          currentImageIndex={currentImageIndex}
                          imageUrls={imageUrls}
                          totalData={totalData}
                        />
                      </div>
                    </div>

                    {/* IMAGE SECTION */}
                    <div className="d-flex justify-content-center align-items-center mb-4">

                      {/* PREV */}
                      <button
                        className="btn btn-outline-primary rounded-circle me-3 shadow-sm"
                        style={{ width: "50px", height: "50px" }}
                        onClick={prevHandler}
                      >
                        <ArrowBackIosIcon fontSize="small" />
                      </button>

                      {/* IMAGE CARD */}
                      <div className="card border-0 shadow-sm rounded-4 p-2">
                        <ImageSectionCSV
                          imageContainerRef={imageContainerRef}
                          currentImageIndex={currentImageIndex}
                          imageUrls={imageUrls}
                          imageRef={imageRef}
                          currentData={currentData}
                          zoomLevel={zoomLevel}
                          selectedCoordintes={selectedCoordintes}
                          templateHeaders={templateHeaders}
                        />
                      </div>

                      {/* NEXT */}
                      <button
                        className="btn btn-outline-primary rounded-circle ms-3 shadow-sm"
                        style={{ width: "50px", height: "50px" }}
                        onClick={nextHandler}
                      >
                        <ArrowForwardIosIcon fontSize="small" />
                      </button>
                    </div>

                    {/* CORRECTION SECTION */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-header bg-white fw-semibold border-0">
                        Correction Panel
                      </div>
                      <div className="card-body">
                        <CorrectionField
                          subData={subData}
                          currentData={currentData}
                          taskId={taskId}
                          nextHandler={nextHandler}
                          currIndex={currIndex}
                          imageFocusHandler={imageFocusHandler}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL */}
        <ConfirmationModal
          confirmationModal={confirmationModal}
          onSubmitHandler={onCompleteHandler}
          setConfirmationModal={setConfirmationModal}
          heading={"Confirm Task Completion"}
          message={
            "Please confirm if you would like to mark this task as complete."
          }
        />
      </div>
    )}
  </>
);
};

export default UserCorrectionData;
