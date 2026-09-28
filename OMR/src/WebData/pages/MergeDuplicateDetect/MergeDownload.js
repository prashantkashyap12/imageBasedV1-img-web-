import React from "react";

const MergeDownload = ({ setDownload }) => {
  return (
    // <div className="flex justify-center items-center w-[100%] pt-20 h-[100vh] bg-blue-500">
    <div className="w-1/4 h-1/4 bg-white flex flex-col p-10 rounded-lg relative">
      <div
        onClick={() => {
          setDownload(false);
        }}
        className=" absolute right-5 top-2 text-xl font-bold text-red-500"
      >
        <button>X</button>
      </div>
      <h1 className="text-center text-2xl">Dowload Updated Files</h1>
      <div className="flex justify-center items-center mt-14">
        <button className="bg-green-500 text-white py-2 px-4 rounded-3xl">
          Download
        </button>
      </div>
    </div>
    // </div>
  );
};

export default MergeDownload;
