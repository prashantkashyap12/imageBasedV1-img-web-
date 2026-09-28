import React, { useContext, useEffect, useState } from "react";
import UploadFile from "../../../assets/images/CsvUploaderImg copy.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dataContext from "../../Store/DataContext";
import ModalWithLoadingBar from "../../UI/Modal";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";

import {
  onGetTemplateHandler,
} from "../../services/common";
import TemplateRemove from "./TemplateRemove";
import TemplateEdit from "./TemplateEdit";
import UploadSection from "./UploadSection";
import PreFilesModal from "./PreFilesModal";
import Papa from "papaparse";
import API_NODE from "WebData/apiNode/apiNode";
import fetchApi from "WebData/fetchApi/fetchApi";

const CsvUploader = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFolder, setImageFolder] = useState(null);
  const [selectedId, setSelectedId] = useState();
  const [allTemplates, setAllTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [imageNames, setImageNames] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [removeId, setRemoveId] = useState(null);
  const [removeModal, setRemoveModal] = useState(false);
  const [openPreFile, setOpenPreFile] = useState(false);
  const [confirmation, setConfirmationModal] = useState(false);
  const [preFiles, setPreFiles] = useState([]);
  const dataCtx = useContext(dataContext);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("userData"));

  const data = allTemplates?.find((item) => item.id === selectedId);
  localStorage.setItem("editModel", editModal);

  // Tab Button disabled
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // getting all the templates and users
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const csvTemplates = response.filter(
          (data) => data.TempleteType === "Data Entry",
        );
        setAllTemplates(csvTemplates);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, []);

  const filteredTemplates = allTemplates?.filter((template) =>
    template.name.toLowerCase().includes(templateName.toLowerCase()),
  );

  const onCsvFileHandler = (event) => {
    const fileInput = event.target.files[0];
    handleFileUpload(
      fileInput,
      ["csv", "xlsx"],
      "Please upload a CSV or Excel file.",
      setCsvFile,
    );
  };

  const handleImageNameChange = (index, value) => {
    setImageNames((prevNames) => {
      const updatedNames = [...prevNames];
      updatedNames[index] = value;
      return updatedNames;
    });
  };

  const onImageFolderHandler = (event) => {
    const fileInput = event.target.files[0];
    console.log(fileInput);
    handleFileUpload(
      fileInput,
      ["zip", "folder", "rar"],
      "Please upload a ZIP file or a folder.",
      setImageFolder,
    );
  };

  const handleFileUpload = (file, allowedExtensions, errorMessage, setFileState,) => {
    if (file) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        toast.error(errorMessage);
        console.log(errorMessage);
        return;
      }
      setFileState(file);
    }
  };

  const uploadChunk = async (zipFile, chunkIndex, totalChunks, overallProgressCallback,) => {
    try {
      const zipFileName = imageFolder?.name;

      const formData = new FormData();
      formData.append("chunk", zipFile);
      formData.append("csvFile", csvFile);
      formData.append("chunkIndex", chunkIndex);
      formData.append("totalChunks", totalChunks);

      // Append the original zip file name
      formData.append("zipFileName", zipFileName);

      const imageNamesString = imageNames.join(",");

      const response = await API_NODE.post(
        `${window.SERVER_IP}/upload/${selectedId}?imageNames=${imageNamesString}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: token,
          },
          onUploadProgress: (progressEvent) => {
            const chunkProgress =
              (progressEvent.loaded / progressEvent.total) * 100;
            overallProgressCallback(chunkProgress, chunkIndex);
          },
        },
      );

      return response.data; // Return the response from the server
    } catch (error) {
      throw new Error(error.response?.data?.error || "Upload failed.");
    }
  };

  const onSaveFilesHandler = async () => {
    setConfirmationModal(false);

    const chunkSize = 2 * 1024 * 1024 * 1024 - 1; // 1 byte less than 2GB
    const totalChunks = Math.ceil(imageFolder.size / chunkSize);
    let start = 0;
    let chunkIndex = 0;
    let overallProgress = 0;

    setLoading(true);
    dataCtx.modifyIsLoading(true);
    const imageNamesString = imageNames.join(",");
    try {
      let fileId;

      const updateOverallProgress = (chunkProgress, chunkIndex) => {
        overallProgress =
          ((chunkIndex + chunkProgress / 100) / totalChunks) * 100;
        setProgress(Math.round(overallProgress));
      };

      while (start < imageFolder.size) {
        const chunk = imageFolder.slice(start, start + chunkSize);

        fileId = await uploadChunk(
          chunk,
          chunkIndex,
          totalChunks,
          updateOverallProgress,
        );

        start += chunkSize;
        chunkIndex += 1;
      }

      // All chunks have been uploaded, navigate and finalize
      toast.success("Files uploaded successfully!");
      dataCtx.modifyIsLoading(false);
      localStorage.setItem("fileId", JSON.stringify(fileId));
      localStorage.setItem("pageCount", JSON.stringify(data.pageCount));
      localStorage.setItem("imageName", JSON.stringify(imageNamesString));

      navigate(`/admin/csvuploader/duplicatedetector/${fileId.templeteId}`);
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onTemplateEditHandler = async (id) => {
    try {
      const response = await API_NODE.post(
        `${window.SERVER_IP}/edit/template/${id}`,
        {},
      );

      if (response.data.imagePaths.length === 0) {
        toast.warning("No image found.");
        return;
      }
      console.log(response.data);
      const data = response.data.template;

      const templateData = {
        templateData: {
          name: data.name,
          pageCount: data.pageCount,
          id: data.id,
          typeOption: data.typeOption,
          patternDefinition: data.patternDefinition,
          blankDefination: data.blankDefination,
          isPermittedToEdit: data.isPermittedToEdit,
        },
        metaData: [...data.templetedata],
      };

      console.log(templateData);

      dataCtx.modifyTemplateData(templateData);
      localStorage.setItem("templateOption", JSON.stringify("updating"));
      localStorage.setItem("images", JSON.stringify(response.data.imagePaths));
      localStorage.setItem("templeteId", JSON.stringify(data.id));
      console.log(data.id);
      navigate("/admin/imageuploader/scanner");
    } catch (error) {
      console.error("Error uploading files: ", error);
    }
  };

  const onTemplateRemoveHandler = async (id) => {
    try {
      await API_NODE.post(`${window.SERVER_IP}/delete/template/${id}`, {});
      const filteredTemplates = allTemplates.filter((data) => data.id !== id);
      setAllTemplates(filteredTemplates);
      setRemoveModal(false);
      toast.success("Succesfully template removed.");
    } catch (error) {
      console.log(error?.response?.data?.error);
      toast.warning(error?.response?.data?.error);
    }
  };

  const onGetCsvInfoHandler = async () => {
    try {
      const response = await API_NODE.get(
        `${window.SERVER_IP}/getcsvinfo/${selectedId}`,
        {
          headers: {
            token: token,
          },
        },
      );
      setPreFiles(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const onDownloadFileHandler = async (file) => {
    try {
      const response = await fetchApi(
        `${window.SERVER_IP}/download/csv/${file.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      a.download = file.csvFile;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const onFileHeaderDetailsHandler = async () => {
    if (!selectedId) {
      toast.error("Please select the template name.");
      return;
    }


    if (imageNames.length !== data?.pageCount) {
      toast.error("Please fill in all image fields.");
      return;
    }

    if (!csvFile) {
      toast.error("Please upload the CSV file.");
      return;
    }

    if (!imageFolder) {
      toast.error("Please upload the image folder.");
      return;
    }

    try {
      const response = await API_NODE.get(
        `${window.SERVER_IP}/get/csvheader/${selectedId}`,
      );

      if (response.data?.data?.length === 0) {
        setConfirmationModal(true);
        return;
      }
      const expectedHeaders = response.data || [];
      if (expectedHeaders.length === 0) {
        setConfirmationModal(true);
        return;
      }

      // Parse the uploaded CSV file using PapaParse
      Papa.parse(csvFile, {
        complete: (result) => {
          if (!result || !result.data || result.data.length === 0) {
            toast.error("Invalid or empty CSV file.");
            return;
          }
          // Extract headers from the first row
          const uploadedHeaders = Object.keys(result.data[0]).map((header) =>
            header.trim(),
          );

          // Check if headers match
          const mismatchedHeader = expectedHeaders.find(
            (header, index) => header !== uploadedHeaders[index],
          );

          if (mismatchedHeader) {
            toast.error(
              `Header mismatch: expected "${mismatchedHeader}" but got "${uploadedHeaders[expectedHeaders.indexOf(mismatchedHeader)] ||
              "undefined"
              }"`,
            );
          } else {
            toast.success("Headers match correctly!");
          }
          console.log(expectedHeaders);
          console.log(uploadedHeaders);

          if (mismatchedHeader) {
            toast.error(
              "Please upload the correct CSV file. Headers do not match.",
            );
            return;
          }

          setConfirmationModal(true);
        },
        header: true,
        skipEmptyLines: true,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error fetching CSV headers.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        {/* MAIN CARD */}
        <div className="col-lg-12 col-xl-10">
          <div className="card shadow-lg border-0">
            {/* HEADER */}
            <div
              className="card-header text-white"
              style={{ background: "linear-gradient(to right, #2563eb, #1e40af)", borderTopLeftRadius: "0.5rem", borderTopRightRadius: "0.5rem", }}>
              <h4 className="mb-0">CSV Uploader</h4>
              <small>Upload your CSV and image folder easily</small>
            </div>

            {/* BODY */}
            <div className="card-body p-4">
              <UploadSection
                onImageFolderHandler={onImageFolderHandler}
                setEditId={setEditId}
                setEditModal={setEditModal}
                data={data}
                templateName={templateName}
                setTemplateName={setTemplateName}
                imageNames={imageNames}
                filteredTemplates={filteredTemplates}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                setRemoveModal={setRemoveModal}
                setRemoveId={setRemoveId}
                handleImageNameChange={handleImageNameChange}
                UploadFile={UploadFile}
                csvFile={csvFile}
                onCsvFileHandler={onCsvFileHandler}
                imageFolder={imageFolder}
                setOpenPreFile={setOpenPreFile}
                onGetCsvInfoHandler={onGetCsvInfoHandler}
                onFileHeaderDetailsHandler={onFileHeaderDetailsHandler}
              />
            </div>

            {/* FOOTER (optional) */}
            <div className="card-footer text-muted text-end">
              <small>Supported formats: CSV, XLSX, ZIP</small>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <TemplateEdit
        onTemplateEditHandler={onTemplateEditHandler}
        editModal={editModal}
        editId={editId}
        setEditModal={setEditModal}
      />

      <TemplateRemove
        removeModal={removeModal}
        onTemplateRemoveHandler={onTemplateRemoveHandler}
        setRemoveModal={setRemoveModal}
        removeId={removeId}
      />

      <ModalWithLoadingBar
        isOpen={loading}
        onClose={() => { }}
        progress={progress}
        message="Uploading csv and image zip the files..."
      />

      <PreFilesModal
        onDownloadFileHandler={onDownloadFileHandler}
        files={preFiles}
        setOpenPreFile={setOpenPreFile}
        openPreFile={openPreFile}
      />

      <ConfirmationModal
        confirmationModal={confirmation}
        onSubmitHandler={onSaveFilesHandler}
        setConfirmationModal={setConfirmationModal}
        heading="Upload Files Confirmation"
        message="This is for file upload"
      />
    </div>
  );
};

export default CsvUploader;
