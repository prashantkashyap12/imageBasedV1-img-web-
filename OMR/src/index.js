import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Styles
import "./App.css";

// Argon + Icons
import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Providers (RENAMED to avoid conflict)
import DataProviderOne from "./context/DataProvider";        // Project 1
import DataProviderTwo from "../src/WebData/Store/DataProvider";    // Project 2
import { ScanProvider } from "./context/ScanningContext";

// App
import App from "./App";

// Syncfusion
import { registerLicense } from "@syncfusion/ej2-base";

// Syncfusion CSS (cleaned)
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-react-grids/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-calendars/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-notifications/styles/material.css";

// License
registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXhdcHRVQmVeV0F3Wks="
);

// ✅ Load config BEFORE app starts
fetch("/config.json")
  .then((response) => response.json())
  .then((config) => {
    // Global variables (used in old API code)
    window.APP_IP = config.APP_IP;
    window.SERVER_IP = config.SERVER_IP;

    console.log("APP_IP:", window.APP_IP);
    console.log("SERVER_IP:", window.SERVER_IP);

    const root = ReactDOM.createRoot(document.getElementById("root"));

    root.render(
      <BrowserRouter>
        <ScanProvider>
          <DataProviderOne>
            <DataProviderTwo>
              <App />

              <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
                theme="light"
              />
            </DataProviderTwo>
          </DataProviderOne>
        </ScanProvider>
      </BrowserRouter>
    );
  })
  .catch((error) => {
    console.error("Error loading config:", error);
  });