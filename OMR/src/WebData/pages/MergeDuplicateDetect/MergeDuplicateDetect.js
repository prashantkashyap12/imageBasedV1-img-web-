import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDuplicateData } from "../../services/common";

import MergeDownload from "./MergeDownload";

import { toast } from "react-toastify";

const MergeDuplicateDetect = () => {
  const [headers, setHeaders] = useState([]);
  const [download, setDownload] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const {selectedFile } = location.state || {};
  useEffect(() => {
  if (location.state?.headers) {
    setHeaders(location.state.headers);
  }
}, [location.state]);

  console.log(headers)
  console.log("Selected File",selectedFile);

  const headerHandler = async (header) => {
    try {
      const response = await getDuplicateData(header, selectedFile);
      console.log(response, "response");
      if (!response?.success) {
        toast.warning(response.message);
        return;
      }
      if (response?.success) {
        toast.success(response.message);
        const duplicates = response.duplicates;
        navigate("/merge/duplicate/data", {
          state: { duplicates, header, selectedFile },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const allHeaders = headers.map((header, index) => {
    return (
      <div key={index} className="flex justify-between items-center">
        <div className="whitespace-nowrap px-4 py-4">
          <div className="flex items-center">
            <div className="ml-4 w-full font-semibold">
              <div className="px-2">{header}</div>
            </div>
          </div>
        </div>
        <div className="whitespace-nowrap px-4 py-4 text-right">
          <button
            className="rounded-3xl border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white"
            onClick={() => headerHandler(header)}
          >
            Check
          </button>
        </div>
      </div>
    );
  });

  console.log(download);

  return (
    <>
      <div className="flex justify-center items-center w-[100%] pt-20 h-[100vh] bg-blue-500">
        {download && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <MergeDownload setDownload={setDownload} />
          </div>
        )}
        <div className=" w-[800px]">
          {/* MAIN SECTION  */}
          <section className="mx-auto w-full max-w-7xl  px-12 py-6 bg-white rounded-xl">
            <div className="flex flex-col space-y-4  md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <h2 className="text-3xl font-semibold">Find Duplicates</h2>
              </div>
            </div>
            <div className="mt-6 mb-4 flex flex-col w-full">
              <div className="mx-4 -my-2  sm:-mx-6 lg:-mx-8">
                <div className="inline-block  py-2 align-middle md:px-6 lg:px-8">
                  <div className=" border border-gray-200 md:rounded-lg ">
                    <div className="divide-y divide-gray-200 ">
                      <div className="bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="px-8 py-3.5 text-left text-xl font-semibold text-gray-700">
                            <span>Headers</span>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200 bg-white overflow-y-auto max-h-[300px] w-full">
                        {allHeaders}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button className="group inline-block rounded-3xl bg-teal-500 p-[2px] text-white hover:bg-blue-600 focus:outline-none focus:ring active:text-opacity-75">
                <span
                  className="block  px-8 py-2 text-md font-medium group-hover:bg-transparent"
                  onClick={() => setDownload(true)}
                >
                  Complete
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default MergeDuplicateDetect;
