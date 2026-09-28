import React, { useState } from "react";
import { MdCompareArrows } from "react-icons/md";

const PartA = () => {

  const [files, setFiles]=useState({
    CSVfile1: null,
    CSVfile2: null,
    ZIPfile: null,
  })

  const handleFileChange = (event, fileType) => {
    const selectedFile = event.target.files[0]; // Get the first selected file
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: selectedFile,
    }));
  };

  // Function to log files when button is clicked
  const handleCompare = () => {
    console.log("Selected Files:", files);
  };

  return (
    <div className="h-[100vh] pt-24 overflow-y-hidden bg-blue-500">
      <h1 className="text-center mb-6 text-white text-2xl font-bold">
        UPLOAD CSV AND ZIP
      </h1>
      <div className="mx-4 sm:mx-16 lg:mx-40">
        <div className="flex flex-row items-center  lg:gap-7 mb-6">
          <p className="text-white font-semibold lg:text-xl min-w-40">
            Select CSV File 1:{" "}
          </p>
          <div className="w-10/12">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => handleFileChange(e, "CSVfile1")}
              class="w-full text-gray-400 font-semibold text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded"
            />
          </div>
        </div>
        <div className="flex flex-row items-center  lg:gap-7 mb-6">
          <p className="text-white font-semibold lg:text-xl min-w-40">
            Select CSV File 2:{" "}
          </p>
          <div className="w-10/12">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => handleFileChange(e, "CSVfile2")}
              class="w-full text-gray-400 font-semibold text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded"
            />
          </div>
        </div>
        <div className="flex flex-row items-center  lg:gap-7 mb-6">
          <p className="text-white font-semibold lg:text-xl min-w-40">
            Select ZIP File:{" "}
          </p>
          <div className="w-10/12">
            <input
              type="file"
              accept=".zip,.folder,.rar"
              onChange={(e) => handleFileChange(e, "ZIPfile")}
              multiple
              name="file"
              class="w-full text-gray-400 font-semibold text-sm bg-white border file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-10">
        <button
        onClick={handleCompare}
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-all flex justify-center items-center gap-2"
        >
          <MdCompareArrows size={23} /> Compare and Match
        </button>
      </div>
    </div>
  );
};

export default PartA;
