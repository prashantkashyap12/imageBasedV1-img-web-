import NormalHeader from "components/Headers/NormalHeader";
import { fetchAllTemplate, getLayoutDataById } from "helper/TemplateHelper";
import getBaseUrl from "services/BackendApi";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { saveImagesToDB, getImageCountFromDB } from "./imageIndexedDB";

// ─── Helpers for the image previews ─────────────────────────────────────────
const IMG_EXT = /\.(jpe?g|png|bmp|gif|webp|tiff?)$/i;

/** "wFileManager\a\b 1.jpg" + base -> "http://host:port/wFileManager/a/b%201.jpg" */
const joinUrl = (base, path) => {
  const p = String(path).trim().replace(/\\/g, "/");
  if (/^https?:\/\//i.test(p)) {
    try {
      return encodeURI(decodeURI(p));
    } catch {
      return p;
    }
  }
  return `${String(base).replace(/\/+$/, "")}/${encodeURI(p.replace(/^\/+/, ""))}`;
};

/** First string value of an object that looks like an image path. */
const findImagePath = (obj) => {
  if (!obj || typeof obj !== "object") return "";
  for (const v of Object.values(obj)) {
    if (typeof v === "string" && IMG_EXT.test(v.trim())) return v.trim();
  }
  return "";
};

// Defined outside the page so it does not remount (and reload the image) on every render
const PreviewBox = ({
  title,
  url,
  loading,
  error,
  emptyText,
  caption,
  onError,
  action,
}) => (
  <div style={{ flex: "1 1 200px", minWidth: 0 }}>
    <div className="small fw-semibold mb-1">{title}</div>

    <div
      style={{
        border: "1px solid #e8ecf3",
        borderRadius: 6,
        background: "#fff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* image / empty text */}
      <div
        style={{
          position: "relative",
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Open full size"
            style={{ position: "absolute", inset: 0, display: "block" }}
          >
            <img
              src={url}
              alt={title}
              onError={onError}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </a>
        ) : (
          <span className="text-muted small px-2 text-center">
            {loading ? "Loading…" : error || emptyText}
          </span>
        )}
      </div>

      {/* control lives inside the box */}
      {action && <div className="p-2 border-top">{action}</div>}
    </div>

    {caption && (
      <div className="text-muted small mt-1 text-truncate">{caption}</div>
    )}
  </div>
);

const ScanPage = () => {
  const [showPrint, setShowPrint] = useState(true);
  const [template, setTemplate] = useState([]);
  const [folderName, setFolderName] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageCount, setImageCount] = useState(0);

  // Previews shown before the user confirms
  const [folderPreview, setFolderPreview] = useState({ url: "", name: "" });
  const [templatePreview, setTemplatePreview] = useState({
    url: "",
    loading: false,
    error: "",
  });
  const folderUrlRef = useRef("");
  const templateReqRef = useRef(0);

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

  // Release the folder preview's object URL when leaving the page
  useEffect(
    () => () => {
      if (folderUrlRef.current) URL.revokeObjectURL(folderUrlRef.current);
    },
    [],
  );

  const extractTempByUser = (fileName = "", templateId) => {
    if (!fileName || !fileName.includes("##")) return null;

    const [templateNames, extractEmpId] = fileName.split("##");

    const isOwner = String(extractEmpId) === String(empid);
    const isAdmin = role === "admin";

    if (isOwner || isAdmin) {
      return { templateNames, empid: extractEmpId, templateId };
    }

    return null;
  };

  const TemplateOption = (template || [])
    .map((item) => extractTempByUser(item.fileName, item.id))
    .filter(Boolean);

  // ── Template image preview ────────────────────────────────────────────────
  const loadTemplatePreview = async (id) => {
    const token = ++templateReqRef.current; // ignore answers of older selections
    setTemplatePreview({ url: "", loading: !!id, error: "" });
    if (!id) return;

    try {
      const [base, res] = await Promise.all([
        getBaseUrl(),
        getLayoutDataById(id),
      ]);
      const layout = res?.data;
      console.log("[ScanPage] template layout data:", layout);

      // 1) an image path stored on the template record
      let path = findImagePath(layout);

      // 2) otherwise look inside the template's JSON file
      if (!path && layout?.jsonPath) {
        const { data: json } = await axios.get(joinUrl(base, layout.jsonPath));
        path = findImagePath(json);
      }

      if (token !== templateReqRef.current) return;

      if (!path) {
        setTemplatePreview({
          url: "",
          loading: false,
          error: "No image found for this template.",
        });
        return;
      }
      setTemplatePreview({
        url: joinUrl(base, path),
        loading: false,
        error: "",
      });
    } catch (error) {
      console.error("[ScanPage] template preview:", error);
      if (token !== templateReqRef.current) return;
      setTemplatePreview({
        url: "",
        loading: false,
        error: "Could not load the template image.",
      });
    }
  };

  // Select local image folder
  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      toast.error("No folder selected");
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (!imageFiles.length) {
      toast.error("No images found in the selected folder");
      return;
    }

    const relativePath = imageFiles[0].webkitRelativePath;

    const selectedFolder = relativePath ? relativePath.split("/")[0] : "";

    setFolderName(selectedFolder);

    // Preview: the first image of the folder (by name)
    const first = [...imageFiles].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    )[0];
    if (folderUrlRef.current) URL.revokeObjectURL(folderUrlRef.current);
    folderUrlRef.current = URL.createObjectURL(first);
    setFolderPreview({ url: folderUrlRef.current, name: first.name });

    try {
      setIsLoadingImages(true);

      // Store original File objects in IndexedDB
      await saveImagesToDB(imageFiles);

      // Get actual count from IndexedDB
      const count = await getImageCountFromDB();

      setImageCount(count);

      // Optional flag for your current flow
      localStorage.setItem("imagesAreReadyInDb", "true");

      toast.success(`${count} image(s) selected and stored`);
    } catch (error) {
      console.error("Error storing images in IndexedDB:", error);

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
      localStorage.setItem("folderName", folderName);

      localStorage.setItem("templateId", templateId);

      navigate("/admin/job-queue/adminscanjobnew", {
        state: {
          hasImages: true,
          imageCount: imageCount,
        },
      });

      setShowPrint(false);
    } catch (error) {
      console.error("Navigation error:", error);

      toast.error("Failed to continue");
    }
  };

  if (!showPrint) {
    return null;
  }

  return (
    <>
      <NormalHeader />

      <div
        className="top-50 start-50 translate-middle bg-white p-4 shadow rounded"
        style={{
          position: "absolute",
          top: "150px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px",
          zIndex: 999,
          width: "min(560px, 94vw)",
        }}
      >
        <h5 className="mb-3">Please Select the template and upload folder:</h5>

        {/* Each control now lives inside its own preview box */}
        <div className="d-flex flex-wrap mb-3" style={{ gap: 12 }}>
          {/* Folder box: Select Folder button */}
          <PreviewBox
            title="Selected folder"
            url={folderPreview.url}
            emptyText="No folder selected"
            caption={
              folderPreview.name
                ? `${folderPreview.name}${imageCount ? ` · ${imageCount} images` : ""}`
                : ""
            }
            action={
              <>
                <label
                  htmlFor="folderInput"
                  className="btn btn-info btn-sm w-100 mb-0"
                  style={{ cursor: "pointer" }}
                >
                  {folderName ? "Change Folder" : "Select Folder"}
                </label>
                <input
                  id="folderInput"
                  type="file"
                  webkitdirectory=""
                  directory=""
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleFolderSelect}
                />
              </>
            }
          />

          {/* Template box: dropdown */}
          <PreviewBox
            title="Selected template"
            url={templatePreview.url}
            loading={templatePreview.loading}
            error={templatePreview.error}
            emptyText="No template selected"
            onError={() =>
              setTemplatePreview((p) => ({
                ...p,
                url: "",
                error: "The template image could not be loaded.",
              }))
            }
            action={
              <select
                className="form-control form-control-sm"
                id="optionSelect"
                value={templateId || ""}
                onChange={(e) => {
                  setTemplateId(e.target.value);
                  loadTemplatePreview(e.target.value);
                }}
              >
                <option value="">-- Select a Template --</option>

                {TemplateOption.map((item) => (
                  <option key={item.templateId} value={item.templateId}>
                    {item.templateNames}
                  </option>
                ))}
              </select>
            }
          />
        </div>

        {/* Confirm */}
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-success"
            onClick={handleSuccess}
            disabled={loading || isLoadingImages}
          >
            Confirm
          </button>
        </div>

        {/* Close */}
        {/* <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          onClick={() => navigate(-1)}
        /> */}
      </div>
    </>
  );
};

export default ScanPage;
