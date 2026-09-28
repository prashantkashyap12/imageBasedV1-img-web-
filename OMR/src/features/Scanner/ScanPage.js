import NormalHeader from "components/Headers/NormalHeader";
import { fetchAllTemplate } from "helper/TemplateHelper";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {  saveImagesToDB,  getImageCountFromDB,} from "./imageIndexedDB"

const ScanPage = () => {
  const [showPrint, setShowPrint] = useState(true);
  const [template, setTemplate] = useState([]);
  const [folderName, setFolderName] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageDbKey, setImageDbKey] = useState(null); // Reference to stored images
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageCount, setImageCount] = useState(0);

  const navigate = useNavigate();

  const data = localStorage.getItem("userData");
  const empid = JSON.parse(data)?.empid;
  const role = JSON.parse(data)?.role;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const templates = await fetchAllTemplate();

        if (templates) {
          setTemplate(templates?.body);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const extractTempByUser = (fileName = "", templateId) => {
    if (!fileName || !fileName.includes("##")) return null;

    const [templateNames, extractEmpId] = fileName.split("##");

    const isOwner = String(extractEmpId) === String(empid);
    const isAdmin = role === "admin";

    if (isOwner || isAdmin) {
      return { templateNames, empid: extractEmpId, templateId, };
    }

    return null;
  };

  const TemplateOption = (template || [])
    .map((item) => extractTempByUser(item.fileName, item.id))
    .filter(Boolean);

  // Select local image folder
  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      toast.error("No folder selected");
      return;
    }

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (!imageFiles.length) {
      toast.error("No images found in the selected folder");
      return;
    }

    const relativePath = imageFiles[0].webkitRelativePath;

    const selectedFolder = relativePath
      ? relativePath.split("/")[0]
      : "";

    setFolderName(selectedFolder);

    try {
      setIsLoadingImages(true);

      // Store original File objects in IndexedDB
      await saveImagesToDB(imageFiles);

      // Get actual count from IndexedDB
      const count = await getImageCountFromDB();

      setImageCount(count);

      // Optional flag for your current flow
      localStorage.setItem("imagesAreReadyInDb", "true");

      toast.success(
        `${count} image(s) selected and stored`
      );
    } catch (error) {
      console.error(
        "Error storing images in IndexedDB:",
        error
      );

      setImageCount(0);

      localStorage.removeItem("imagesAreReadyInDb");

      toast.error("Failed to store images");
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleSuccess = () => {
    if (!folderName) {
      toast.error("No Folder Selected");
      return;
    }

    if (imageCount <= 0) {
      toast.error("No Images Selected");
      return;
    }

    if (!templateId) {
      toast.error("No Template Selected");
      return;
    }

    try {
      localStorage.setItem(
        "folderName",
        folderName
      );

      localStorage.setItem(
        "templateId",
        templateId
      );

      navigate(
        "/admin/job-queue/adminscanjobnew",
        {
          state: {
            hasImages: true,
            imageCount: imageCount,
          },
        }
      );

      setShowPrint(false);
    } catch (error) {
      console.error(
        "Navigation error:",
        error
      );

      toast.error(
        "Failed to continue"
      );
    }
  };

  if (!showPrint) {
    return null;
  }

  return (
    <>
      <NormalHeader />

      <div className="top-50 start-50 translate-middle bg-white p-4 shadow rounded"
        style={{ position: "absolute", top: "150px", left: "50%", transform: "translateX(-50%)", padding: "10px", zIndex: 999, width: "500px", }}      >
        <h5 className="mb-3">
          Please Select the template and upload folder:
        </h5>

        {/* Folder Selection */}
        <div className="mb-3">
          <label htmlFor="folderInput" className="col-form-label">
            Data Path:
          </label>

          <div className="d-flex align-items-center gap-2">
            <input type="text" disabled value={folderName || ""} className="form-control" placeholder="Select image folder" />

            <label
              htmlFor="folderInput"
              className="btn btn-info ml-1 mb-0"
              style={{ width: "60%", cursor: "pointer", whiteSpace: "nowrap", }}>
              Choose Directory
            </label>

            <input id="folderInput" type="file" webkitdirectory="" directory="" multiple hidden accept="image/*" onChange={handleFolderSelect} />
          </div>

          {/* {(isLoadingImages || imageDbKey) ? (
            <small className="text-success d-block mt-2">
              {isLoadingImages ? "Preparing images..." :
                imageDbKey ? `${imageCount} image(s) stored in DB` :
                  `${imageCount} image(s) selected`}
            </small>
          ) : (
            <small className="text-muted d-block mt-2">
              No images selected
            </small>
          )} */}
        </div>

        {/* Template Selection */}
        <div className="mb-3">
          <label htmlFor="optionSelect" className="form-label">
            Select Template
          </label>

          <select className="form-control" id="optionSelect" value={templateId || ""} onChange={(e) => setTemplateId(e.target.value)}          >
            <option value="">
              -- Select a Template --
            </option>

            {TemplateOption.map((item) => (
              <option key={item.templateId} value={item.templateId}>
                {item.templateNames}
              </option>
            ))}
          </select>
        </div>

        {/* Confirm */}
        <div className="d-flex justify-content-center">
          <button className="btn btn-success" onClick={handleSuccess} disabled={loading || isLoadingImages}>
            Confirm
          </button>
        </div>

        {/* Close */}
        <button type="button" className="btn-close position-absolute top-0 end-0 m-3" aria-label="Close" onClick={() => setShowPrint(false)} />
      </div>
    </>
  );
};

export default ScanPage;