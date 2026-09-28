import axios from "axios";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import FormDataEntrySection from "./FormDataSection";
import ButtonDataEntrySection from "./ButtonDataEntrySection";
import ImageDataEntrySection from "./ImageDataEntrySection";
import QuestionDataEntrySection from "./QuestionDataEntrySection";
import {
  updateCsvData,
  updateCurrentIndex,
  onGetTemplateHandler,
} from "../services/common";
import API_NODE from "WebData/apiNode/apiNode";
import { fetchAllUsers } from "helper/userManagment_helper";

const DataMapping = () => {
  const token = JSON.parse(localStorage.getItem("userData"));
  const taskData = JSON.parse(localStorage.getItem("taskdata"));

  const [data, setData] = useState([]);
  const [prevData, setprevData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [imageData, setImageData] = useState([]);
  const [currentIndex, setCurrenIndex] = useState(null);
  const [formData, setFormData] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editedData, setEditedData] = useState([]);
  const [templateData, settemplateData] = useState([]);
  const [prevdata, setload] = useState(true);
  const [invalidMap, setInvalidMap] = useState(); // { key: boolean }

  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [userEmail, setUserEmail] = useState([]);

  // console.log(invalidMap);
  const imageRef = useRef(null);
  const inputRefs = useRef({});
  const invalidIndex = useRef(0);
  const inputIndexRef = useRef(null);
  const tempdata = useRef();
  const lastKey = useRef(null);
  // console.log(inputRefs);

  const saveRanRef = useRef(false);
  // useEffect(() => {
  //   const enableFullscreen = () => {
  //     const element = document.documentElement;
  //     if (!document.fullscreenElement) {
  //       element.requestFullscreen?.() ||
  //         element.mozRequestFullScreen?.() ||
  //         element.webkitRequestFullscreen?.() ||
  //         element.msRequestFullscreen?.();
  //     }
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       enableFullscreen();
  //     }
  //   };

  //   // Run fullscreen logic when component mounts
  //   enableFullscreen();

  //   // Listen for visibility change to restore fullscreen if needed
  //   document.addEventListener("visibilitychange", handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [currentIndex]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetchAllUsers();

        const userData = JSON.parse(localStorage.getItem("userData"));
        const empid = userData?.empid;

        const currentUser = response.result.find(
          (user) => user.empId === empid,
        );
        const currentUserEmail = currentUser.empEmail;
        setUserEmail(currentUserEmail);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);


  useEffect(() => {
    const enableFullscreen = async () => {
      try {
        const element = document.documentElement;

        if (!document.fullscreenElement) {
          await (element.requestFullscreen?.() ||
            element.mozRequestFullScreen?.() ||
            element.webkitRequestFullscreen?.() ||
            element.msRequestFullscreen?.());
        }
      } catch (err) {
        console.log("Fullscreen blocked:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // ⚠️ Only try if already fullscreen once (avoid permission error)
        if (document.fullscreenElement) {
          enableFullscreen();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentIndex]);

  const handleStartFullscreen = async () => {
    try {
      const element = document.documentElement;
      await element.requestFullscreen();
    } catch (err) {
      console.log("User denied fullscreen:", err);
    }
  };

  // useEffect(() => {
  //   inputRefs.current = {};
  //   invalidIndex.current = 0; // Reset the index when currentIndex changes
  // }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (loadingData) return; // Prevent key nav during fetch

      if (event.ctrlKey && event.key === "ArrowLeft") {
        event.preventDefault();
        prevHandler();
      }

      if (event.ctrlKey && event.key === "ArrowRight") {
        event.preventDefault();
        nextHandler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [loadingData]);

  const fetchIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchId = ++fetchIdRef.current;

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const response = await API_NODE.post(
          `${window.SERVER_IP}/get/csvdata`,
          { taskData },
          { headers: { token }, signal: controller.signal },
        );

        // Ignore outdated request
        if (fetchId !== fetchIdRef.current) return;

        tempdata.current = response.data;
        setData(response.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        toast.error(err?.message);
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoadingData(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [currentIndex]);

  useEffect(() => {
    setFormData(Array.isArray(data.formdata) ? data.formdata : [data.formdata]);
  }, [data]);

  useEffect(() => {
    const handleTabKey = (e) => {
      if (e.key !== "Tab") return;

      e.preventDefault();

      const invalidKeys = Object.keys(inputRefs.current);

      const sortedData = [...invalidKeys].sort((a, b) => {
        const isAAlphaOnly = /^[A-Za-z]+$/.test(a);
        const isBAlphaOnly = /^[A-Za-z]+$/.test(b);

        if (isAAlphaOnly && !isBAlphaOnly) return -1;
        if (!isAAlphaOnly && isBAlphaOnly) return 1;

        if (isAAlphaOnly && isBAlphaOnly) return a.localeCompare(b);

        const prefixA = a.match(/[A-Za-z]+/)[0];
        const prefixB = b.match(/[A-Za-z]+/)[0];

        if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);

        const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);

        return numA - numB;
      });

      if (sortedData.length === 0) return;

      // NEW: Use KEY tracking instead of index tracking
      let nextIndex = 0;

      if (lastKey.current) {
        const currentIndex = sortedData.indexOf(lastKey.current);
        if (currentIndex !== -1) {
          nextIndex = currentIndex + 1;
        }
      }

      if (nextIndex >= sortedData.length) nextIndex = 0;

      const keyToFocus = sortedData[nextIndex];
      const element = inputRefs.current[keyToFocus];

      if (element) {
        element.focus();
        lastKey.current = keyToFocus; // THE FIX
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [formData]);
  const prevHandler = async () => {
    if (loadingData) return; // Prevent skipping during fetch

    try {
      const parsed = JSON.parse(localStorage.getItem("taskdata"));
      const taskId = parsed.id;
      const res = await updateCurrentIndex(
        taskId,
        "prev",
        tempdata.current?.id,
      );
      if (!res) return toast.error("No Previous Page!");

      setCurrenIndex(res);
      lastKey.current = null;
    } catch (err) {
      toast.error(err?.message);
    } finally {
      inputRefs.current = {};
      invalidIndex.current = 0;
    }
  };
  const nextBlockedRef = useRef(false);

  const nextHandler = async () => {
    // Block when data is loading OR throttled
    if (loadingData || nextBlockedRef.current) return;

    // Throttle repeated calls (e.g., holding the key)
    nextBlockedRef.current = true;
    setTimeout(() => {
      nextBlockedRef.current = false;
    }, 200); // same 200ms throttle window

    try {
      const parsed = JSON.parse(localStorage.getItem("taskdata"));
      const taskId = parsed.id;

      console.log(parsed);

      const res = await updateCurrentIndex(
        taskId,
        "next",
        tempdata.current?.id,
        userEmail
      );
      if (!res) return toast.error("Last page reached");

      setCurrenIndex(res);
      lastKey.current = null;
    } catch (err) {
      toast.error(err?.message);
    } finally {
      inputRefs.current = {};
      invalidIndex.current = 0;
    }
  };
  // console.log(tempdata.current);
  const saveHandler = async (updatedData) => {
    const mergedData = {
      ...(Array.isArray(formData) && formData.length > 0
        ? formData[0]
        : formData),
      ...updatedData,
    };
    // console.log(mergedData);
    const obj = {
      taskId: taskData.id,
      templateId: taskData.templeteId,
      parentId: tempdata.current.id,
      id: data,
      userEmail: userEmail,
      editedData: editedData,
      updatedData: mergedData,
    };
    // console.log(data.id);
    // console.log(obj);

    const res = await updateCsvData(obj);
    console.log(res);
    if (res.status >= 400 && res.status <= 600) {
      // console.log(res);
      if (Array.isArray(res?.response?.data?.errors)) {
        res?.response?.data?.errors.map((err) => {
          toast.warning(err.message, { autoClose: 7000 });
        });
      } else {
        const msg = res?.response?.data?.message || "Something went wrong!";
        toast.warning(msg, { autoClose: 5000 });
      }
    } else {
      if (res.status === 200) {
        nextHandler();
        lastKey.current = null;
        // setData([]);
      }
    }
    console.log(res);
  };

  const zoomInHandler = () => {
    setZoomLevel((prevZoomLevel) => Math.min(prevZoomLevel * 1.1, 3));
  };

  const zoomOutHandler = () => {
    setZoomLevel((prevZoomLevel) => Math.max(prevZoomLevel * 0.9, 0.5));
  };

  const onInialImageHandler = () => {
    setZoomLevel(1);
    setSelectedCoordinates(false);
    if (imageRef.current) {
      imageRef.current.style.transform = "none";
      imageRef.current.style.transformOrigin = "initial";
    }
  };
  // console.log(invalidMap);
  return (
    <div className="bg-white vh-100 pt-5">
      <div className="d-flex flex-column bg-white flex-lg-row ">
        {/* FormData Section */}
        <FormDataEntrySection
          data={data}
          formData={formData}
          setFormData={setFormData}
          setEditedData={setEditedData}
          setImageData={setImageData}
          inputRefs={inputRefs}
          imageData={imageData}
          editedData={editedData}
          templateData={templateData}
          setInvalidMap={setInvalidMap}
          invalidMap={invalidMap}
        />

        <div className="d-flex flex-column w-100">
          {/* Button Section */}
          <ButtonDataEntrySection
            data={data}
            zoomInHandler={zoomInHandler}
            zoomOutHandler={zoomOutHandler}
            onInialImageHandler={onInialImageHandler}
          />

          {/* Image Section */}
          <ImageDataEntrySection
            data={data}
            imageData={imageData}
            nextHandler={nextHandler}
            prevHandler={prevHandler}
            zoomLevel={zoomLevel}
            imageRef={imageRef}
            loadingData={loadingData}
          />

          {/* Question Section */}
          <QuestionDataEntrySection
            data={data}
            saveHandler={saveHandler}
            setImageData={setImageData}
            setEditedData={setEditedData}
            inputRefs={inputRefs}
            editedData={editedData}
            inputIndexRef={inputIndexRef}
            invalidIndex={invalidIndex}
            settemplateData={settemplateData}
            formData={formData}
            loadingData={loadingData}
            lastKey={lastKey}
          />
        </div>
      </div>
      <button
        className="btn btn-primary px-4 bottom-0 fw-semibold shadow-sm"
        onClick={handleStartFullscreen}
      >
        Start Work (Fullscreen)
      </button>
    </div>
  );
};

export default DataMapping;
