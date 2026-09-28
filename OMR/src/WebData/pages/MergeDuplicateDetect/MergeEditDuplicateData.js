import React, { useEffect, useState } from "react";
import img23 from "./img23.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  REACT_APP_IP,
  updateDuplicateDataWithValue,
} from "../../services/common";
import { toast } from "react-toastify";

const MergeEditDuplicateData = ({
  templateId,
  editModalData,
  setEditViewModal,
  imageUrl,
  imageColName,
  selectedFile,
}) => {
  const [formData, setFormData] = useState(editModalData || {});
  const [editableData, setEditableData] = useState({});
  const [headerData, setHeaderData] = useState([]);
  // const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const header = Object.keys(editModalData);
    if (header) {
      const filteredHeader = header.filter(
        (item) => item !== "foreignKeyData" && item !== "column"
      );

      setHeaderData(filteredHeader);
    }
  }, [editModalData]);
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value, // Update specific field
    }));
  };

  const alldata = headerData.map((item, index) => {
    return (
      <div key={index} className="flex justify-center overflow-y-auto">
        <div className="py-2 px-2 text-center w-1/3">{item}</div>
        <div className="py-2 p-2 px-2 text-center">
          <input
            className="text-center p-2 rounded-3xl"
            type="text"
            value={formData[item] || ""}
            onChange={(e) => handleInputChange(item, e.target.value)}
          />
        </div>
      </div>
    );
  });
  const backHandler = () => {
    setEditViewModal(false);
  };

  const saveHandler = async () => {
    const obj = { ...formData };
    const id = obj["id"];
    delete obj["column"];
    delete obj["id"];
    delete obj["index"];
    delete obj["foreignKeyData"];

    try {
      const res = await updateDuplicateDataWithValue(id, selectedFile, obj);

      if (res?.success) {
        toast.success("Updated the data successfully");
        setEditViewModal(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div className="w-[100%] pt-20 lg:h-[100vh] bg-blue-500 lg:flex gap-10 xl:gap-80 px-5">
        <div className="flex flex-row lg:flex-col justify-center items-center lg:ms-3 w-full md:w-[70%] lg:w-[35%] mx-auto">
          <div className="mx-6 inline-block align-bottom lg:mt-2  bg-teal-100 rounded-xl  text-left shadow-md transform transition-all  sm:align-middle  w-[100%]  lg:w-[98%] 2xl:w-[72%]">
            <div className="px-4 py-2 lg:py-3">
              <div className="sm:flex w-full">
                <div className="text-center  sm:text-left w-full">
                  <div className=" font-semibold my-2 overflow-auto h-[70vh]">
                    <div className="divide-y divide-gray-100 text-sm">
                      <div className="flex flex-col">{alldata}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex  justify-around pb-3 lg:w-full">
              <button className="group inline-block rounded-3xl bg-blue-500 p-[2px] text-white hover:bg-indigo-600 focus:outline-none focus:ring active:text-opacity-75">
                <span
                  className="block rounded-sm  px-10 py-2 text-md font-medium group-hover:bg-transparent"
                  onClick={backHandler}
                  //  onClick={() => {
                  //     navigate("/merge/duplicate/data");
                  //   }}
                >
                  Back
                </span>
              </button>
              <button
                className="group inline-block rounded-3xl bg-blue-500 p-[2px] text-white hover:bg-indigo-600 focus:outline-none focus:ring active:text-opacity-75"
                onClick={saveHandler}
              >
                <span className="block rounded-sm  px-10 py-2 text-md font-medium group-hover:bg-transparent">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>
       
        <div className="mx-auto max-w-screen-xl px-2 lg:py-1 sm:px-6 lg:px-8">
          <div className=" flex justify-center h-full">
            <div className="pt-4">
              {imageUrl && (
                <div
                  style={{
                    position: "relative",
                  }}
                  className="w-full pb-4 overflow-auto h-[97%]"
                >
                  <img
                    // src={`data:image/jpeg;base64,${imageUrl}`}
                    src={`http://${
                      window.APP_IP
                    }:4000/images/${imageUrl}/${editModalData[imageColName]
                      .split("\\")
                      .pop()}`}
                    alt="Selected"

                    draggable={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MergeEditDuplicateData;
