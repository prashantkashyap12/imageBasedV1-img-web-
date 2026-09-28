import React from "react";

// import { ROLES} from "./roles"

// Non-WebData Feature Components
import Index from "../features/Dashboard/Index";
import Profile from "../auth/Profile";
import UserManagment from "../features/UserManagement/UserManagment";
import Template from "../features/TemplateManager/Template";
import FolderStructure from "../features/FolderManagement/FolderStructure";
import ScanPage from "../features/Scanner/ScanPage";
import ResultGeneration from "../features/ResultGeneration/ResultGeneration";
import Mergecsv from "../features/MergeCsv/mergecsv";
import ScanedList from "../features/ScannedData/ScanedData";
import AdminScanJob from "../features/Scanner/AdminScanJob";
// import Pricing from "features/Subscription/PricingHome";
// import PaymentStatus from "features/Subscription/pages/PaymentStatus";
// import SubscriptionCreate from "features/Subscription/pages/CreateSubscription";
import TemplateEditor from "../features/TemplateManager/TemplateEditor";
import ResultTablePage from "../common/ResultTablePage";

// Auth Components
import Login from "../auth/Login";
import Signup from "../auth/Signup";

// WebData Components (Imported but not modified)
import UserTaskAssined from "WebData/pages/DataMatching/UserTaskAssined";
import DataMatching from "WebData/pages/DataMatching/DataMatching";
import ImageScanner from "WebData/pages/ImageScanner/ImageScanner";
import CsvUploader from "WebData/pages/CsvUploader/CsvUploader";
import FieldDecision from "WebData/pages/FieldDecision/FieldDecision";
import TemplateMapping from "WebData/pages/TemplateMapping/TemplateMapping";
import UserCorrectionData from "WebData/pages/CSV Comparer/UserCorrectionData";
import Assignee from "WebData/pages/CSV Comparer/Assignee";
import ImageUpload from "WebData/pages/ImageUploader/ImageUploader";
import TaskManager from "WebData/pages/TaskManager/TaskManager";
import DataMapping from "WebData/DataEntryMapping/DataMapping";
import CsvTaskStatus from "WebData/pages/CsvTaskStatus/CsvTaskStatus";
import CsvHomepage from "WebData/pages/CSV Comparer/CsvHomepage";
import DuplicityDetect from "WebData/pages/DuplicityDetect/DuplicityDetect";

// Wrapper component to handle Data Entry routing based on role at render-time
const DataMatchingRoute = () => {
  const role = JSON.parse(localStorage.getItem("userData"))?.role;
  return role !== "admin" ? <UserTaskAssined /> : <DataMatching />;
};

// const {
//   ADMIN, OPERATOR, MODERATOR
// } = ROLES


const routes = [
  // ==========================================
  // AUTH LAYOUT ROUTES
  // ==========================================
  {
    path: "/login",
    component: Login,
    layout: "/auth",
    showInSidebar: false,
  },
  {
    path: "/signup",
    component: Signup,
    layout: "/auth",
    showInSidebar: false,
  },

  // ==========================================
  // ADMIN NESTED LAYOUT ROUTES (With Sidebar/Navbar)
  // ==========================================
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: Index,
    layout: "/admin",
    showInSidebar: true,
    // roles: [ ADMIN, OPERATOR, MODERATOR ]
  },
  {
    path: "/template",
    name: "Template Manager",
    icon: "ni ni-collection text-red",
    component: Template,
    layout: "/admin",
    showInSidebar: true,
    // roles: [ADMIN],
  },
  {
    path: "/user-managment",
    name: "User Managment",
    icon: "ni ni-circle-08 text-info",
    component: UserManagment,
    layout: "/admin",
    showInSidebar: true,
  },
  {
    path: "/job-queue",
    name: "Scan OMR Sheets",
    icon: "ni ni-money-coins text-yellow",
    component: ScanPage,
    layout: "/admin",
    showInSidebar: true,
  },
  {
    path: "/job-queue/adminscanjobnew",
    component: AdminScanJob,
    layout: "/admin",
    showInSidebar: false,
  },
  {
    path: "/job-queue/adminscanjob",
    component: AdminScanJob,
    layout: "/admin",
    showInSidebar: false,
  },
  {
    path: "/scaned-list",
    name: "Scanned List",
    icon: "ni ni-app text-success",
    component: ScanedList,
    layout: "/admin",
    showInSidebar: true,
  },
  {
    path: "/server-folder",
    name: "Folder Management",
    icon: "ni ni-settings-gear-65 text-primary",
    component: FolderStructure,
    layout: "/admin",
    showInSidebar: true,
  },
  {
    path: "/imageuploader",
    name: "Create Template",
    icon: "ni ni-single-copy-04 text-wa",
    component: ImageUpload,
    layout: "/admin",
    showInSidebar: true,
    roleRequired: "admin",
  },
  {
    path: "/imageuploader/scanner",
    name: "Scanner",
    component: ImageScanner,
    layout: "/admin",
    showInSidebar: false,
  },
  {
    path: "/csvuploader",
    name: "CSV Uploader",
    icon: "ni ni-bold-up text-success",
    component: CsvUploader,
    layout: "/admin",
    showInSidebar: true,
    roleRequired: "admin",
  },
  {
    path: "/datamatching",
    name: "Data Entry",
    icon: "ni ni-bullet-list-67 text-info",
    component: DataMatchingRoute,
    layout: "/admin",
    showInSidebar: true,
  },
  {
    path: "/user-profile",
    name: "Profile",
    icon: "ni ni-single-02 text-yellow",
    component: Profile,
    layout: "/admin",
    showInSidebar: false,
  },
  {
    path: "/result-generation",
    name: "Result Generation",
    icon: "ni ni-paper-diploma text-danger",
    component: ResultGeneration,
    layout: "/admin",
    showInSidebar: true,
  },
  {
    path: "/mergecsv",
    name: "Merge CSV",
    icon: "ni ni-archive-2 text-primary",
    component: Mergecsv,
    layout: "/admin",
    showInSidebar: true,
  },
  // {
  //   path: "/pricing",
  //   name: "Subscription",
  //   icon: "ni ni-money-coins text-success",
  //   component: Pricing,
  //   layout: "/admin",
  //   showInSidebar: true,
  // },
  // {
  //   path: "/payment-status",
  //   component: PaymentStatus,
  //   layout: "/admin",
  //   showInSidebar: false,
  // },
  {
    path: "/template/create-template/:Id",
    component: TemplateEditor,
    layout: "/admin",
    showInSidebar: false,
  },

  // ==========================================
  // STANDALONE / FULL PAGE ROUTES (No Sidebar Layout)
  // ==========================================
  {
    path: "/admin/result-table",
    component: ResultTablePage,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/csvuploader/duplicatedetector/:id",
    component: DuplicityDetect,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/csvuploader/templatemap/:id",
    component: TemplateMapping,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/csvuploader/fieldDecision/:id",
    component: FieldDecision,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/csvuploader/taskAssign/:id",
    component: TaskManager,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/datamatching/:id",
    component: DataMapping,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/datamatching/csvtaskstatus",
    component: CsvTaskStatus,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/datamatching/correct_compare_csv",
    component: UserCorrectionData,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/comparecsv",
    component: CsvHomepage,
    layout: "standalone",
    showInSidebar: false,
  },
  {
    path: "/admin/comparecsv/assign_operator/:id",
    component: Assignee,
    layout: "standalone",
    showInSidebar: false,
  },
  // {
  //   path: "/admin/Subscription/create",
  //   component: SubscriptionCreate,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/payment-status",
  //   component: PaymentStatus,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
];

export default routes;
