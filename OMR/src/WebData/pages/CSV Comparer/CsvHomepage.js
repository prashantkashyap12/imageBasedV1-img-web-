import Customselect from "../../UI/Customselect";
import Input from "../../UI/Input";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import OptimisedList from "../../UI/OptimisedList";
import Button from "@mui/material/Button";
import { useContext, useEffect, useState } from "react";
import dataContext from "../../Store/DataContext";
import axios from "axios";
import { useNavigate } from "react-router";
import LoadingButton from "@mui/lab/LoadingButton";
import ModalWithLoadingBar from "../../UI/Modal";
import MultList from "../../UI/MultList";
import NewSelect from "../../UI/NewSelect";
import API_NODE from "WebData/apiNode/apiNode";

const CsvHomepage = () => {
  const [loading, setLoading] = useState(false);
  const dataCtx = useContext(dataContext);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const token = JSON.parse(localStorage.getItem("userData"));
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    dataCtx.addToCsvHeader([]);
  }, []);

  useEffect(() => {
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.userSelect = "auto";
    };
  }, []);

  const compareHandler = () => {
    const {
      primaryKey = "",
      skippingKey = "",
      firstInputFileName = "",
      secondInputFileName = "",
      uploadZipImage = [],
      fileId = "",
      firstInputCsvFiles = [],
      imageColName = "",
      formFeilds = [],
    } = dataCtx;

    if (secondInputFileName.length === 0) {
      alert("Please Select template then select second CSV file");
      return;
    }

    if (dataCtx.uploadZipImage.length === 0) {
      alert("Please select template then select image zip file");
      return;
    }

    if (firstInputCsvFiles.length === 0) {
      alert("Choose first CSV file");
      return;
    }

    if (primaryKey === "") {
      alert("Please select primary key");
      return;
    }

    if (imageColName === "") {
      alert("Please select image column name");
      return;
    }

    const sendRequest = async () => {
      try {
        setLoading(true);

        const formData = new FormData();
        formData.append("firstInputCsvFile", firstInputCsvFiles);
        formData.append("zipImageFile", uploadZipImage);
        formData.append("fileId", fileId);
        formData.append("secondInputFileName", firstInputFileName);
        formData.append("firstInputFileName", secondInputFileName);
        formData.append("primaryKey", primaryKey);
        formData.append("skippingKey", skippingKey);
        formData.append("imageColName", imageColName);
        formData.append("formFeilds", formFeilds);
        formData.append("templateId", selectedTemplate);

        const response = await API_NODE.post(
          `${window.SERVER_IP}/compareData`,
          formData,
          {
            headers: {
              token: token,
            },
            onUploadProgress: (progressEvent) => {
              const percentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentage);
            },
          }
        );

        setLoading(false);

        navigate(`/admin/comparecsv/assign_operator/${selectedTemplate}`, {
          state: response.data,
        });
      } catch (err) {
        if (err.response && err.response.data) {
          alert(`Error Occured : ${err.response.data.err}`);
        }
        setLoading(false);
      }
    };

    sendRequest();
  };

  return (
    <main className="bg-primary py-5" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div
          className="bg-white rounded shadow p-4 p-md-5 mx-auto"
          style={{ maxWidth: "1100px" }}
        >
          {/* Title */}
          <h2 className="text-center mb-4 fw-bold text-primary">
            MATCH AND COMPARE DATA
          </h2>

          {/* Row 1 */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <NewSelect
                label="Select Template"
                onTemplateSelect={setSelectedTemplate}
              />
            </div>
            <div className="col-md-6">
              <NewSelect
                label="Select Csv Files 2"
                state="second"
                selectedTemplate={selectedTemplate}
                onTemplateSelect={(item) => {
                  dataCtx.addSecondInputFileName(item);
                }}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <NewSelect
                label="Select Zip Files"
                state="third"
                selectedTemplate={selectedTemplate}
              />
            </div>
            <div className="col-md-6">
              <Input label="Select Csv Files 1" state="first" type="text/csv" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Customselect label="Select Primary Key" />
            </div>
            <div className="col-md-6">
              <Customselect label="Select Image Column" />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="row g-4">
            {/* Box 1 */}
            <div className="col-md-4">
              <div className="border rounded p-3 h-100">
                <div className="d-flex justify-content-between mb-2">
                  <small className="fw-semibold">
                    Select Key For Skipping Comparison
                  </small>
                  <Button size="small">Select All</Button>
                </div>
                <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                  <OptimisedList />
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="col-md-4">
              <div className="border rounded p-3 h-100 bg-light">
                <div className="d-flex justify-content-between mb-2">
                  <small className="fw-semibold">
                    Select Form Feilds For Mult or Blank
                  </small>
                  <Button size="small">Clear All</Button>
                </div>
                <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                  <MultList />
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="col-md-4 d-flex align-items-end">
              <LoadingButton
                color="primary"
                onClick={compareHandler}
                loading={loading}
                loadingPosition="start"
                startIcon={<CompareArrowsIcon />}
                variant="contained"
                className="w-100"
              >
                Compare And Match
              </LoadingButton>
            </div>
          </div>

          {/* Modal */}
          <ModalWithLoadingBar
            isOpen={loading}
            onClose={() => {}}
            progress={progress}
            message="Comparing and matching the files..."
          />
        </div>
      </div>
    </main>
  );
};

export default CsvHomepage;