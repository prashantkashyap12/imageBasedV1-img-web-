import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dataContext from "../../../WebData/Store/DataContext";
import RemoveTemplate from "./RemoveTemplate";
import TemplateData from "./TemplateData";
import CoordinateData from "./CoordinateData";
import OptionData from "./OptionData";
import DynamicInput from "./DynamicInput";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import Permissions from "./Permissions";
import useAutoScroll from "../../components/useAutoScroll";
import { IoSettings } from "react-icons/io5";
import SettingModel from "./SettingModel";
import API_NODE from "WebData/apiNode/apiNode";

const ImageScanner = () => {
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [image, setImage] = useState(null);
  const [inputField, setInputField] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [removeModal, setRemoveModal] = useState(false);
  const [removeId, setRemoveId] = useState("");
  const [selectType, setSelectType] = useState("");
  const [inputCount, setInputCount] = useState(4);
  const [inputValues, setInputValues] = useState([]);
  const [lengthOfField, setLengthOfField] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [optionModel, setOptionModel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dataCtx = useContext(dataContext);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedtemplate, setselectedtemplate] = useState("");

  const [templatePermissions, setTemplatePermissions] = useState({
    blankDefination: "",
    patternDefinition: "",
    isPermittedToEdit: false,
  });
  const [permissionModal, setPermissionModal] = useState(false);
  const [selectedCoordinateData, setSelectedCoordinateData] = useState(null);
  const [templateData, setTemplateData] = useState({
    name: "",
    pageCount: "",
  });
  const [questionRange, setQuestionRange] = useState({
    min: "",
    max: "",
  });
  const containerRef = useRef(null);

  const { updateScroll, stopScroll } = useAutoScroll({
    containerRef,
    threshold: 50,
    speed: 10,
  });

  const [settingModel, setsettingModel] = useState(false);
  const token = localStorage.getItem("token");
  const templateId = JSON.parse(localStorage.getItem("templeteId"));

  const editFlag = localStorage.getItem("editModel");
  const imageRef = useRef(null);
  const navigate = useNavigate();
  const imageURL = JSON.parse(localStorage.getItem("images"));

  console.log(templateId);
  // console.log(templatePermissions);
  useEffect(() => {
    if (imageURL && imageURL.length > 0) {
      setImage(imageURL[currentImageIndex]);
    }
  }, [currentImageIndex, imageURL]);

  useEffect(() => {
    const handlekeyDown = (e) => {
      if (e.key === "ArrowRight") {
        onNextImageHandler();
      } else if (e.key === "ArrowLeft") {
        onPreviousImageHandler();
      }
    };
    window.addEventListener("keydown", handlekeyDown);
    return () => {
      window.removeEventListener("keydown", handlekeyDown);
    };
  }, []);

  const onNextImageHandler = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < imageURL.length - 1 ? prevIndex + 1 : prevIndex,
    );
    setSelection(null);
  };

  const onPreviousImageHandler = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex,
    );
  };

  // Function to handle mouse down event for drag selection
  const handleMouseDown = (e) => {
    const boundingRect = imageRef.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;
    setDragStart({ x: offsetX, y: offsetY });
  };
  // Function to handle mouse up event for drag selection
  const handleMouseUp = () => {
    if (dragStart) {
      setDragStart(null);
      setOpen(true);
      stopScroll();
    }
  };
  // Function to handle mouse move event for drag selection
  const handleMouseMove = (e) => {
    if (!e.buttons || !dragStart) {
      return;
    }
    const boundingRect = imageRef?.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;

    updateScroll(e.clientY);



    setSelection({
      coordinateX: Math.min(dragStart.x, offsetX),
      coordinateY: Math.min(dragStart.y, offsetY),
      width: Math.abs(offsetX - dragStart.x),
      height: Math.abs(offsetY - dragStart.y),
      pageNo: currentImageIndex,
    });
  };

  const onResetHandler = () => {
    setDragStart(null);
    setSelection(null);
    setQuestionRange({
      min: "",
      max: "",
    });
    setFieldType("");
    setLengthOfField("");
    setSelectType("");
    setInputField("");
    setOpen(false);
  };

  // get templalte mapping data
  useEffect(() => {
    if (!dataCtx?.templateData) return;

    let metaData = [];

    // CASE 1: correct structure
    if (dataCtx.templateData.metaData) {
      metaData = dataCtx.templateData.metaData;
    }
    // CASE 2: direct array (your current case)
    else if (Array.isArray(dataCtx.templateData)) {
      metaData = dataCtx.templateData;
    }

    const formattedData = metaData.map((item) => ({
      ...item,
      fId: item.fId || item.id,
      coordinateX: Number(item.coordinateX),
      coordinateY: Number(item.coordinateY),
      width: Number(item.width),
      height: Number(item.height),
      pageNo: Number(item.pageNo),
      fieldLength: Number(item.fieldLength),
    }));

    setSelectedCoordinates(formattedData);
  }, [dataCtx?.templateData]);

  // Function to submit drag selection and name of options like -> Roll Number , or Subject
  const onSelectedHandler = () => {
    if (!fieldType) {
      toast.warning("Please select a field type.");
      return;
    }

    if (fieldType === "questionsField") {
      if (!questionRange || !questionRange.min || !questionRange.max) {
        toast.warning("Please ensure all fields are properly filled out.");
        return;
      }

      if (Number(questionRange.min) > Number(questionRange.max)) {
        toast.warning(
          "Ensure the minimum value is less than the maximum value.",
        );
        return;
      }
      const allSelectedCoordinates = selectedCoordinates.filter(
        (item) => item.fieldType === "questionsField",
      );
      if (allSelectedCoordinates.length > 0) {
        const existingField = questionRange.min + "--" + questionRange.max;
        const existingFieldData = allSelectedCoordinates.find(
          (item) => item.attribute === existingField,
        );
        if (existingFieldData) {
          toast.warning("This field already exists.");
          return;
        }
      }
    } else {
      if (fieldType === "formField" && inputField.includes("-")) {
        toast.warning("Please refrain from using hyphens (-) in this field.");
        return;
      }

      if (!inputField) {
        toast.warning("Please ensure to add the coordinate name.");
        return;
      }
      if (!selectType) {
        toast.warning("Please select the type field.");
        return;
      }

      if (selectType === "number") {
        if (!questionRange.min || !questionRange.max) {
          toast.warning("Please enter the range of the field.");
          return;
        }
        if (Number(questionRange.min) > Number(questionRange.max)) {
          toast.warning(
            "Ensure the minimum value is less than the maximum value.",
          );
          return;
        }
      }

      const allSelectedCoordinates = selectedCoordinates.filter(
        (item) => item.fieldType === "formField",
      );
      if (allSelectedCoordinates.length > 0) {
        const existingFieldData = allSelectedCoordinates.find(
          (item) => item.attribute === inputField,
        );

        if (existingFieldData) {
          toast.warning("This field already exists.");
          return;
        }
      }
    }

    if (fieldType === "formField" && !lengthOfField) {
      toast.warning("Please enter the length of the field.");
      return;
    }

    const newObj = {
      ...selection,
      fieldType,
      fId: Math.random().toString(),
      attribute:
        fieldType === "formField"
          ? inputField
          : questionRange.min + "--" + questionRange.max,
      dataFieldType: selectType,
      fieldRange:
        selectType === "number"
          ? questionRange.min + "--" + questionRange.max
          : "0",
      fieldLength: fieldType === "formField" ? lengthOfField : 0,
    };

    if (selectedCoordinateData) {
      console.log(selectedCoordinateData);
      const updatedObj = {
        Id: selectedCoordinateData.Id,
        attribute:
          fieldType === "formField"
            ? inputField
            : questionRange.min + "--" + questionRange.max,
        coordinateX: selectedCoordinateData.coordinateX,
        coordinateY: selectedCoordinateData.coordinateY,
        dataFieldType: selectType,
        fId: selectedCoordinateData.fId,
        fieldLength: fieldType === "formField" ? lengthOfField : 0,
        fieldRange:
          selectType === "number"
            ? questionRange.min + "--" + questionRange.max
            : "0",
        fieldType: fieldType,
        height: selectedCoordinateData.height,
        pageNo: selectedCoordinateData.pageNo,
        width: selectedCoordinateData.width,
      };
      const updatedSelectedCoordinate = selectedCoordinates.map((data) => {
        if (data.fId === selectedCoordinateData.fId) {
          return updatedObj;
        }
        return data;
      });
      setSelectedCoordinates(updatedSelectedCoordinate);
    } else {
      setSelectedCoordinates((prev) => [...prev, newObj]);
    }
    console.log(selectType);
    setInputField("");
    setFieldType("");
    setLengthOfField("");
    setSelectType("");
    setQuestionRange({
      min: "",
      max: "",
    });
    // console.log(selectType);

    setOpen(false);
    setSelectedCoordinateData(null);
    toast.success("Coordinate successfully added.");
  };

  const onRemoveSelectedHandler = async () => {
    if (!removeId || !removeId.fId) {
      toast.error("Invalid remove ID");
      return;
    }

    try {
      await API_NODE.delete(
        `${window.SERVER_IP}/delete/templatedata/${removeId.fId}`
      );

      setSelectedCoordinates((prev) =>
        prev.filter(
          (data) => String(data.fId) !== String(removeId.fId)
        )
      );

      toast.success("Successfully deleted coordinate.");

      setRemoveId("");
      setRemoveModal(false);
      setSelection(null);
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!templatePermissions.patternDefinition) {
      toast.error("Please select the pattern");
      return;
    }

    if (selectedCoordinates.length === 0) {
      toast.error("Please select the coordinates");
      return;
    }

    if (optionModel && !selectedRow) {
      toast.warning("Please select the field options.");
      return;
    }

    if (optionModel && inputValues.length <= 0) {
      toast.warning("Please create input boxes.");
      return;
    }

    let selectedValues = [];
    let characters = [];

    switch (selectedRow) {
      case "upper":
        characters = Array.from({ length: inputValues.length }, (_, index) =>
          String.fromCharCode(65 + index),
        );
        break;
      case "lower":
        characters = Array.from({ length: inputValues.length }, (_, index) =>
          String.fromCharCode(97 + index),
        );
        break;
      case "number":
        characters = Array.from({ length: inputValues.length }, (_, index) =>
          (index + 1).toString(),
        );
        break;
      default:
        characters = inputValues.map((value, index) =>
          String.fromCharCode(65 + index),
        );
        break;
    }

    // Iterate through inputValues array
    inputValues.forEach((item, index) => {
      if (!item[selectedRow]) {
        selectedValues.push(characters[index]);
      } else {
        selectedValues.push(item[selectedRow]);
      }
    });

    let concatenatedString = selectedValues.join("-");
    if (!concatenatedString) {
      if (selectedRow === "upper") {
        concatenatedString = "A-B-C-D";
      } else if (selectedRow === "lower") {
        concatenatedString = "a-b-c-d";
      } else if (selectedRow === "number") {
        concatenatedString = "1-2-3-4";
      }
    }
    const data = {
      templateData: {
        name: templateData.name,
        pageCount: imageURL.length,
        typeOption: concatenatedString,
        patternDefinition: templatePermissions.patternDefinition,
        blankDefination: templatePermissions.blankDefination,
        isPermittedToEdit: templatePermissions.isPermittedToEdit,
      },
      templateId: dataCtx?.templateData?.templateData?.id
        ? dataCtx?.templateData?.templateData?.id
        : undefined,
      metaData: [...selectedCoordinates],
    };
    const formData = new FormData();

    // Convert data object to JSON string and append it
    formData.append("data", JSON.stringify(data));
    imageURL.forEach((imageData, index) => {
      const contentType = imageData.split(";")[0].split(":")[1];
      const blob = base64ToBlob(imageData.split(",")[1], contentType);
      const file = new File([blob], `image_${index}.${contentType}`, {
        type: contentType,
      });
      formData.append("images", file);
    });
    try {
      await API_NODE.post(`${window.SERVER_IP}/add/templete`, formData);

      toast.success("Template created & updated successfully!");
      dataCtx.modifyTemplateData(null);
      localStorage.removeItem("images");
      setTemplatePermissions((prevState) => ({
        ...prevState,
        blankDefination: "",
        patternDefinition: "",
        isPermittedToEdit: false,
      }));
      navigate("/admin/imageuploader", {
        replace: true,
      });
      // localStorage.setItem("editModel",false)
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  function base64ToBlob(base64String, contentType) {
    const byteCharacters = atob(base64String);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  // OPTIONS INPUTS
  const handleInputChange = (e, type, index) => {
    const newInputValues = [...inputValues];
    const inputValue = e.target.value.trim();
    if (selectedRow === "upper") {
      // Allow only uppercase letters A-Z
      if (/^[A-Z]$/.test(inputValue)) {
        newInputValues[index][type] = inputValue;
      } else {
        newInputValues[index][type] = "";
      }
    } else if (selectedRow === "lower") {
      // Allow only lowercase letters a-z
      if (/^[a-z]$/.test(inputValue)) {
        newInputValues[index][type] = inputValue;
      } else {
        newInputValues[index][type] = "";
      }
    } else if (selectedRow === "number") {
      // Allow only digits 0-9
      if (/^\d+$/.test(inputValue)) {
        newInputValues[index][type] = inputValue;
      } else {
        newInputValues[index][type] = "";
      }
    } else {
      newInputValues[index][type] = inputValue;
    }

    setInputValues(newInputValues);
  };

  const handleCheckboxChange = (rowType) => {
    setSelectedRow(rowType === selectedRow ? null : rowType);
  };

  const handleCreateInputs = () => {
    const newInputValues = Array.from({ length: inputCount }).map((_, i) => ({
      upper: "",
      lower: "",
      number: "",
    }));
    setInputValues(newInputValues);
  };

  const createInputs = () => {
    return (
      <>
        <DynamicInput
          inputValues={inputValues}
          handleInputChange={handleInputChange}
          selectedRow={selectedRow}
          handleCheckboxChange={handleCheckboxChange}
        />
      </>
    );
  };

  const onEditCoordinateDataHanlder = (id) => {
    const selectedCoordinate = selectedCoordinates.find(
      (data) => data.fId === id,
    );

    if (selectedCoordinate.fieldType === "formField") {
      setFieldType("formField");
      setSelectType(selectedCoordinate.dataFieldType);
      setLengthOfField(selectedCoordinate.fieldLength);
      setInputField(selectedCoordinate.attribute);
      console.log(selectType);

      if (selectedCoordinate.dataFieldType === "number") {
        const [min, max] = selectedCoordinate.fieldRange.split("--");
        setQuestionRange((prev) => ({
          ...prev,
          min: min,
          max: max,
        }));
      }
    } else if (selectedCoordinate.fieldType === "questionsField") {
      setFieldType("questionsField");
      const [min, max] = selectedCoordinate.attribute.split("--");
      setQuestionRange((prev) => ({
        ...prev,
        min: min,
        max: max,
      }));
    }
    setSelectedCoordinateData(selectedCoordinate);
    console.log(selectedCoordinate);
    setOpen(true);
  };

  return (
    <div
      className="d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center"
      style={{ minHeight: "90vh", }}    >
      {/* LEFT SECTION */}
      <div className="d-flex" style={{ width: "40%" }}>
        <div className="d-flex flex-column justify-content-between flex-grow-1">
          <TemplateData
            selectedCoordinates={selectedCoordinates}
            setRemoveModal={setRemoveModal}
            setRemoveId={setRemoveId}
            templateData={templateData}
            onEditCoordinateDataHanlder={onEditCoordinateDataHanlder}
            setTemplateData={setTemplateData}
            setOptionModel={setOptionModel}
            setConfirmationModal={setConfirmationModal}
            setPermissionModal={setPermissionModal}
            templatePermissions={templatePermissions}
            setselectedtemplate={setselectedtemplate}
          />
        </div>
      </div>
      {/* DELETE COMPONENT */}
      <RemoveTemplate
        onRemoveSelectedHandler={onRemoveSelectedHandler}
        removeModal={removeModal}
        setRemoveModal={setRemoveModal}
      />
      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        onSubmitHandler={onSubmitHandler}
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        heading={"Template Submission Confirmation"}
        message={"Are you sure you want to submit the template?"}
      />

     {permissionModal && <Permissions
        permissionModal={permissionModal}
        setPermissionModal={setPermissionModal}
        templatePermissions={templatePermissions}
        setTemplatePermissions={setTemplatePermissions}
      />}

      {/* OPTION DATA */}
      <OptionData
        optionModel={optionModel}
        setOptionModel={setOptionModel}
        inputCount={inputCount}
        setInputCount={setInputCount}
        setInputValues={setInputValues}
        createInputs={createInputs}
        handleCreateInputs={handleCreateInputs}
        setConfirmationModal={setConfirmationModal}
        selectedRow={selectedRow}
      />

      {!image ? (
        <div className="d-flex justify-content-center align-items-center text-center" style={{ width: "75%", height: "90vh" }}>
          <div>
            <ImageNotFound />

            <h1 className="mt-4 fw-bold text-secondary">
              Please Select an Image...
            </h1>

            <p className="mt-3 text-secondary text-center">
              We can't find that page!
            </p>
          </div>
        </div>
      ) : (
        <div style={{ width: "60%" }}>
          <div className="container-fluid px-2 px-sm-3 px-lg-4">
            <h1 className="text-center my-3  fw-bold">
              {currentImageIndex + 1} out of {imageURL.length}
            </h1>

            <div className="mb-3 d-flex justify-content-center">
              <div>
                {image && (
                  <div
                    ref={containerRef}
                    className="w-100 overflow-auto position-relative"
                    style={{ height: "50rem" }}>
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Selected"
                      className="img-fluid"
                      style={{ maxWidth: "35rem", cursor: "crosshair", }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      draggable={false}
                    />

                    <>
                      {selectedCoordinates.filter((data) => data.pageNo === currentImageIndex).map((data, index) => (
                        <div
                          key={index}
                          onDoubleClick={() => onEditCoordinateDataHanlder(data.fId)}
                          style={{
                            border: data?.fId === selectedtemplate ? "3px solid red" : "3px solid #0d6efd", position: "absolute", backgroundColor: data?.fId === selectedtemplate ? "rgba(255,0,0,0.2)" : "rgba(13,110,253,0.2)", left: data.coordinateX, top: data.coordinateY, width: data.width, height: data.height,
                          }}></div>
                      ))}

                      {selection && (
                        <div
                          style={{ border: "3px solid #0d6efd", backgroundColor: "rgba(13,110,253,0.2)", position: "absolute", pointerEvents: "none", left: selection.coordinateX, top: selection.coordinateY, width: selection.width, height: selection.height, }}                        ></div>)}

                      <CoordinateData
                        onSelectedHandler={onSelectedHandler}
                        open={open}
                        setOpen={setOpen}
                        onResetHandler={onResetHandler}
                        fieldType={fieldType}
                        setFieldType={setFieldType}
                        setSelectType={setSelectType}
                        selectType={selectType}
                        questionRange={questionRange}
                        setQuestionRange={setQuestionRange}
                        lengthOfField={lengthOfField}
                        setLengthOfField={setLengthOfField}
                        inputField={inputField}
                        setInputField={setInputField}
                      />
                    </>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS BUTTON */}
      {editFlag === "true" && (
        <div
          onClick={() => setsettingModel(true)}
          className="position-fixed bottom-2 right-5 end-0 m-4 bg-white p-3 rounded-circle shadow"
          style={{ cursor: "pointer" }}>
          <IoSettings style={{ fontSize: "35px", transform: settingModel ? "rotate(90deg)" : "rotate(0deg)", transition: "0.5s", }} />
        </div>
      )}

      <SettingModel
        setsettingModel={setsettingModel}
        settingModel={settingModel}
        token={token}
        templateId={templateId}
        templatePermissions={templatePermissions}
        selectedCoordinates={selectedCoordinates}
      />
    </div>
  );
};

export default ImageScanner;
