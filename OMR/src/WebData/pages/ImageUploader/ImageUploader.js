import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploaderIcon from "../../../assets/images/uploaderIcon.png"
import { toast } from "react-toastify";
import UTIF from "utif";
import InstructionPage from "../../components/InstuctionPage/InstructionPage"

const ImageUpload = () => {
  const [images, setImages] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [openUpload, setOpenUpload] = useState(true);
  const [instruction, setInstruction] = useState(false);
  const navigate = useNavigate();

  console.log(instruction)

  localStorage.setItem("editModel", false);
  localStorage.removeItem("templeteId");
  localStorage.removeItem("images");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleImages(files);
  };

  const handleImages = (files) => {
    if (!files || files.length === 0) return;

    const newImages = [];
    const newImageNames = [];
    let processedCount = 0;

    const updateImages = () => {
      if (processedCount === files.length) {
        setImages((prevImages) => [...prevImages, ...newImages]);
        setImageNames((prevImageNames) => [
          ...prevImageNames,
          ...newImageNames,
        ]);
        toast.success("Images selected successfully.");
      }
    };

    const handleFileLoad = (file, data) => {
      if (file.type === "image/tiff") {
        const arrayBuffer = data;
        const ifds = UTIF.decode(arrayBuffer);
        let pagesProcessed = 0;

        ifds.forEach((ifd, index) => {
          UTIF.decodeImage(arrayBuffer, ifd);
          const rgba = UTIF.toRGBA8(ifd);

          if (ifd.width && ifd.height && rgba) {
            const canvas = document.createElement("canvas");
            canvas.width = ifd.width;
            canvas.height = ifd.height;
            const ctx = canvas.getContext("2d");

            const imageData = new ImageData(
              new Uint8ClampedArray(rgba),
              ifd.width,
              ifd.height
            );

            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob((blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64data = reader.result;
                newImages.push(base64data);
                newImageNames.push(`${file.name} - Page ${index + 1}`);
                pagesProcessed++;
                if (pagesProcessed === ifds.length) {
                  processedCount++;
                  updateImages();
                }
              };
              reader.readAsDataURL(blob);
            }, "image/jpeg");
          } else {
            pagesProcessed++;
            if (pagesProcessed === ifds.length) {
              processedCount++;
              updateImages();
            }
          }
        });
      } else {
        newImages.push(data);
        newImageNames.push(file.name);
        processedCount++;
        updateImages();
      }
    };

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => handleFileLoad(file, reader.result);

      if (file.type === "image/tiff") {
        setOpenUpload(!openUpload);
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFinalSubmit = () => {
    setInstruction(false);
    if (images.length === 0) {
      toast.warning("Please select the images.");
      return;
    }
    if (images.every((image) => image)) {
      localStorage.setItem("images", JSON.stringify(images));
      localStorage.setItem("templateOption", JSON.stringify("creating"));
      navigate("/admin/imageuploader/scanner", { replace: true });
    } else {
      toast.error("Please upload all required images.");
    }
  };

  return (
    <div>
      <section
        className="d-flex justify-content-center align-items-center w-100"
        style={{ minHeight: "100vh", }}>
        <div className="container d-flex justify-content-center align-items-center">
          <div className="border rounded p-5 shadow"
            style={{ backdropFilter: "blur(10px)", borderColor: "#fff", }}>
            <div className="text-white text-center mb-4">
              <h1 className="fw-bold">OMR India Outsources</h1>
            </div>

            <div>
              {imageNames.map((name, index) => (
                <div key={index} className="text-black text-center mb-2">
                  {name}
                </div>
              ))}
            </div>

            {openUpload && (
              <div className="d-flex justify-content-center mt-4 position-relative">
                <label
                  htmlFor="file-upload"
                  className="btn btn-primary d-flex align-items-center px-4 py-2"
                  style={{ borderRadius: "30px", cursor: "pointer" }}
                >
                  <img src={uploaderIcon} alt="uploadIcon" className="me-2" />
                  Upload Images
                </label>

                <input
                  onChange={handleImageChange}
                  id="file-upload"
                  type="file"
                  className="d-none"
                  accept=".tiff,.tif,.jpeg,.jpg"
                  multiple
                />
              </div>
            )}

            <div className="mt-4 d-flex justify-content-center">
              <button
                onClick={() => setInstruction(true)}
                className="btn text-white px-4 py-2"
                style={{ borderRadius: "30px", background: "linear-gradient(to right, #14b8a6, #0d9488)", }}>
                Save
              </button>
            </div>
          </div>
        </div>


        <InstructionPage
          setInstruction={setInstruction}
          instruction={instruction}
          handleFinalSubmit={handleFinalSubmit}
        />
      </section>
    </div>
  );
};

export default ImageUpload;