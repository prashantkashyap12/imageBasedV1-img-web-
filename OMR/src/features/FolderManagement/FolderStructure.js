// import {
//   FileManagerComponent,
//   Inject,
//   NavigationPane,
//   DetailsView,
//   Toolbar,
// } from "@syncfusion/ej2-react-filemanager";
// import * as React from "react";

// import "@syncfusion/ej2-base/styles/bootstrap5.css";
// import "@syncfusion/ej2-icons/styles/bootstrap5.css";
// import "@syncfusion/ej2-inputs/styles/bootstrap5.css";
// import "@syncfusion/ej2-popups/styles/bootstrap5.css";
// import "@syncfusion/ej2-buttons/styles/bootstrap5.css";
// import "@syncfusion/ej2-splitbuttons/styles/bootstrap5.css";
// import "@syncfusion/ej2-navigations/styles/bootstrap5.css";
// import "@syncfusion/ej2-layouts/styles/bootstrap5.css";
// import "@syncfusion/ej2-grids/styles/bootstrap5.css";
// import "@syncfusion/ej2-react-filemanager/styles/bootstrap5.css";
// import SmallHeader from "components/Headers/SmallHeader";

// import "../../App.css";

// import { getUrls } from "helper/url_helper";
// import axios from "axios";

// const Overview = () => {
//   const [hostUrl, setHostUrl] = React.useState("");
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await getUrls();
//         const GetDataURL = response.MAIN_URL;
//         const res = await axios.get(GetDataURL + "api/FileManager/folders", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (res) {
//           setHostUrl(GetDataURL);
//         }
//         console.log(GetDataURL);
//       } catch (error) {
//         console.error("Error fetching URLs:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);



//   if (loading) {
//     return (
//       <div className="loader-container">
//         <p>Loading...</p>
//       </div>
//     );
//   }
//   const handleFailure = (args) => {
//     console.error("File Manager Error: ", args);
//     alert("Failed to connect to the server. Please try again later.");
//   };
//   const handleBeforeSend = (args) => {
//     const token = localStorage.getItem("token");

//     if (args && args.ajaxSettings) {
//       if (!args.ajaxSettings.headers) args.ajaxSettings.headers = {};
//       args.ajaxSettings.headers["Authorization"] = `Bearer ${token}`;

//       // Optional, depending on your backend setup
//       args.ajaxSettings.withCredentials = true;

//       console.log("✅ Header set:", args.ajaxSettings.headers);
//     }
//   };

//   return (
//     <>
//       <div className="full-height-container">
//         <SmallHeader />
//         {hostUrl !== "" && (
//           <div style={{ height: "200px", backgroundColor:"red" }}>
//             <FileManagerComponent
//               id="overview_file"
//               height={500}
//               ajaxSettings={{
//                 url: hostUrl + "api/FileManager/FileOperations",
//                 getImageUrl: hostUrl + "api/FileManager/GetImage",
//                 uploadUrl: hostUrl + "api/FileManager/Upload",
//                 downloadUrl: hostUrl + "api/FileManager/Download",
//               }}
//               beforeSend={handleBeforeSend}
//               toolbarSettings={{
//                 items: [
//                   "NewFolder",
//                   "SortBy",
//                   "Cut",
//                   "Copy",
//                   "Paste",
//                   "Delete",
//                   "Refresh",
//                   "Download",
//                   "Rename",
//                   "Selection",
//                   "View",
//                   "Details",
//                 ],
//               }}
//               contextMenuSettings={{
//                 layout: [
//                   "SortBy",
//                   "View",
//                   "Refresh",
//                   "|",
//                   "Paste",
//                   "|",
//                   "NewFolder",
//                   "|",
//                   "Details",
//                   "|",
//                   "SelectAll",
//                 ],
//               }}
//               view={"Details"}
//               failure={handleFailure}
//             >
//               <Inject services={[NavigationPane, DetailsView, Toolbar]} />
//             </FileManagerComponent>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Overview;

import * as React from "react";
import axios from "axios";
import {
  FileManagerComponent,
  Inject,
  NavigationPane,
  DetailsView,
  Toolbar,
} from "@syncfusion/ej2-react-filemanager";

// Syncfusion Styles
import "@syncfusion/ej2-base/styles/bootstrap5.css";
import "@syncfusion/ej2-icons/styles/bootstrap5.css";
import "@syncfusion/ej2-inputs/styles/bootstrap5.css";
import "@syncfusion/ej2-popups/styles/bootstrap5.css";
import "@syncfusion/ej2-buttons/styles/bootstrap5.css";
import "@syncfusion/ej2-splitbuttons/styles/bootstrap5.css";
import "@syncfusion/ej2-navigations/styles/bootstrap5.css";
import "@syncfusion/ej2-layouts/styles/bootstrap5.css";
import "@syncfusion/ej2-grids/styles/bootstrap5.css";
import "@syncfusion/ej2-react-filemanager/styles/bootstrap5.css";

import SmallHeader from "components/Headers/SmallHeader";
import { getUrls } from "helper/url_helper";
import "../../App.css";

// 1. Static configurations defined outside the component to avoid re-creation
const TOOLBAR_ITEMS = [
  "NewFolder",
  "SortBy",
  "Cut",
  "Copy",
  "Paste",
  "Delete",
  "Refresh",
  "Download",
  "Rename",
  "Selection",
  "View",
  "Details",
];

const CONTEXT_MENU_LAYOUT = [
  "SortBy",
  "View",
  "Refresh",
  "|",
  "Paste",
  "|",
  "NewFolder",
  "|",
  "Details",
  "|",
  "SelectAll",
];

const INJECTED_SERVICES = [NavigationPane, DetailsView, Toolbar];

const Overview = () => {
  const [hostUrl, setHostUrl] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  // 2. Fetch URLs with component unmount safety
  React.useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await getUrls();
        const mainUrl = response?.MAIN_URL || "";

        // Verify folder endpoint connection
        await axios.get(`${mainUrl}api/FileManager/folders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isMounted) {
          setHostUrl(mainUrl);
        }
      } catch (error) {
        console.error("Error fetching URLs:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Stable callback references
  const handleFailure = React.useCallback((args) => {
    console.error("File Manager Error: ", args);
    alert("Failed to connect to the server. Please try again later.");
  }, []);

  const handleBeforeSend = React.useCallback((args) => {
    const token = localStorage.getItem("token");

    if (args?.ajaxSettings) {
      if (!args.ajaxSettings.headers) {
        args.ajaxSettings.headers = {};
      }
      args.ajaxSettings.headers["Authorization"] = `Bearer ${token}`;
      args.ajaxSettings.withCredentials = true;
    }
  }, []);

  // 4. Memoized AJAX configuration
  const ajaxSettings = React.useMemo(() => {
    if (!hostUrl) return null;
    return {
      url: `${hostUrl}api/FileManager/FileOperations`,
      getImageUrl: `${hostUrl}api/FileManager/GetImage`,
      uploadUrl: `${hostUrl}api/FileManager/Upload`,
      downloadUrl: `${hostUrl}api/FileManager/Download`,
    };
  }, [hostUrl]);

  if (loading) {
    return (
      <div className="loader-container">
        <p>Loading...</p>
      </div>
    );
  }

return (
    <>
      <div className="full-height-container">
        {/* Make sure your header is rendering properly here */}
        <SmallHeader />
        
        {hostUrl !== "" && (
          <div style={{ height: "calc(100vh - 70px)", width: "100%" }} >
            <FileManagerComponent
              id="overview_file"
              // 2. Pass "100%" as a string so Syncfusion fills the fixed calc() wrapper
              height="100%" 
              ajaxSettings={{
                url: hostUrl + "api/FileManager/FileOperations",
                getImageUrl: hostUrl + "api/FileManager/GetImage",
                uploadUrl: hostUrl + "api/FileManager/Upload",
                downloadUrl: hostUrl + "api/FileManager/Download",
              }}
              beforeSend={handleBeforeSend}
              toolbarSettings={{
                items: [
                  "NewFolder", "SortBy", "Cut", "Copy", "Paste", 
                  "Delete", "Refresh", "Download", "Rename", 
                  "Selection", "View", "Details",
                ],
              }}
              contextMenuSettings={{
                layout: [
                  "SortBy", "View", "Refresh", "|", "Paste", "|", 
                  "NewFolder", "|", "Details", "|", "SelectAll",
                ],
              }}
              view={"Details"}
              failure={handleFailure}
            >
              <Inject services={[NavigationPane, DetailsView, Toolbar]} />
            </FileManagerComponent>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(Overview);