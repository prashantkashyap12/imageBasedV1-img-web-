import React, { useState, useEffect } from "react";
import { MdOutlineRestartAlt } from "react-icons/md";
import { FaCloudDownloadAlt, FaRegEdit, FaChevronDown } from "react-icons/fa";
import { MdOutlineTaskAlt } from "react-icons/md";
import axios from "axios";
import {
  onGetAllUsersHandler,
  SERVER_IP,
  assignTasksToUsers,
} from "../../services/common";
import API_NODE from "WebData/apiNode/apiNode";

const AdminMatchingTasks = ({
  onCompleteHandler,
  matchingTask,
  onDownloadHandler,
  onSelectedDownloadHandler,
  setTaskEdit,
  setTaskEditId,
  taskType,
  selectedDate,
  setMatchingTask,
  taskstatus,
  setdownloadBox,
  downloadBox,
}) => {
  const token = JSON.parse(localStorage.getItem("userData"));
  const [status, setstatus] = useState({});
  const [openBox, setOpenBox] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [allusers, setallusers] = useState([]);
  const [newTask, setnewTask] = useState([]);

  const toggleReassignBox = (taskId) => {
    setOpenBox(null);
    setActiveTaskId((prev) => (prev === taskId ? null : taskId));
    console.log(activeTaskId);
  };
  const toggleDownloadBox = (taskId) => {
    setdownloadBox((prev) => (prev === taskId ? null : taskId));
  };

  const toggleBox = (taskId) => {
    setActiveTaskId(null);
    setOpenBox(taskId);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await onGetAllUsersHandler();
        setallusers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  console.log(allusers);

  const createNewTask = async (taskData, user) => {
    if (!user || !taskData) return;

    // build the payload expected by the backend (an array of tasks)
    const payload = [
      {
        fileId: taskData.fileId,
        templeteId: taskData.templeteId,
        userId: user.id ?? user._id ?? user.userId, // adjust according to user shape
        min: taskData.min,
        max: taskData.max,
        userName: user.userName || user.empName,
        taskName: taskData.taskName,
        // any other required fields from your API
      },
    ];

    try {
      // call service directly with payload
      const response = await assignTasksToUsers(payload);
      console.log("assign response:", response);

      setOpenBox(null);
      setActiveTaskId(null);
    } catch (err) {
      console.error("assignTasksToUsers failed", err);
    }
  };

  const completeHandler = async (taskId) => {
    const response = await API_NODE.get(
      `${window.SERVER_IP}/submitTask/${taskId}`,
      {
        headers: {
          token: token,
        },
      },
    );
    setMatchingTask((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return { ...task, taskStatus: true };
        }
        return task;
      }),
    );
  };
  const onFilteredTasksHandler = (tasks) => {
    console.log(tasks);

    let filterdTaskData = tasks;
    if (taskType !== "ALL") {
      if (taskType === "pending") {
        filterdTaskData = tasks?.filter((task) => task?.taskStatus === false);
      } else if (taskType === "completed") {
        filterdTaskData = tasks?.filter((task) => task?.taskStatus === true);
      }
    }

    if (selectedDate) {
      filterdTaskData = tasks.filter((item) => {
        const itemDate = new Date(item.createdAt).toLocaleDateString("en-GB");
        const selectedDateFormatted = new Date(selectedDate).toLocaleDateString(
          "en-GB",
        );
        return itemDate === selectedDateFormatted;
      });
    }
    return filterdTaskData;
  };

  const filteredTasks = onFilteredTasksHandler(matchingTask);

  const gettask = async (data) => {
    onCompleteHandler(data);

    setActiveTaskId(null);
    console.log(matchingTask);
    setMatchingTask((prev) =>
      prev.map((task) =>
        task.id === data.id
          ? { ...task, taskStatus: false } // update only the matching one
          : task,
      ),
    );
    console.log(matchingTask);
    //  setstatus(response.data)
  };
  useEffect(() => {
    console.log("matchingTask updated:", matchingTask);
  }, [matchingTask]);

  console.log({ allusers: allusers, taskData: filteredTasks });

  return (
    <div className="w-100">
      {filteredTasks?.map((taskData) => (
        <div
          key={taskData.id}
          className="d-flex align-items-center text-center border-bottom py-2 small"
          style={{ minWidth: "1100px" }} // 👈 important for scroll sync
        >
          {/* Template */}
          <div style={{ width: "120px" }} className="text-truncate">
            {taskData.templateName}
          </div>

          {/* User */}
          <div style={{ width: "120px" }} className="text-truncate">
            {taskData.userName}
          </div>

          {/* Task */}
          <div style={{ width: "140px" }} className="text-truncate">
            {taskData.taskName}
          </div>

          {/* Min */}
          <div style={{ width: "80px" }}>{taskData.min}</div>

          {/* Max */}
          <div style={{ width: "80px" }}>{taskData.max}</div>

          {/* Module */}
          <div style={{ width: "120px" }}>
            <span className="badge bg-info text-dark">
              {taskData.moduleType}
            </span>
          </div>

          {/* Status */}
          <div style={{ width: "120px" }}>
            <span
              className={`badge rounded-pill ${
                !taskData.taskStatus ? "bg-warning text-dark" : "bg-success"
              }`}
            >
              {!taskData.taskStatus && !status.taskStatus ? "!" : "✓"}
            </span>
          </div>

          {/* Reassign */}
          <div className="position-relative" style={{ width: "100px" }}>
            <button
              onClick={() => toggleReassignBox(taskData.id)}
              className={`btn btn-sm ${
                taskData.taskStatus
                  ? "btn-outline-primary"
                  : "btn-outline-secondary"
              }`}
              disabled={!taskData.taskStatus}
            >
              <MdOutlineRestartAlt />
            </button>

            {activeTaskId === taskData.id && (
              <div
                className="position-absolute bg-white border rounded shadow p-2 d-flex flex-column gap-2"
                style={{ width: "200px", zIndex: 20 }}
              >
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => gettask(taskData)}
                >
                  Assign Same
                </button>

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => toggleBox(taskData.id)}
                >
                  Assign Other
                </button>
              </div>
            )}

            {openBox === taskData.id && (
              <div
                className="position-absolute bg-white border rounded shadow p-2"
                style={{ width: "250px", zIndex: 20 }}
              >
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {allusers?.map((user) => {
                    if (
                      user.role !== "admin" &&
                      user.empName !== taskData.userName
                    ) {
                      return (
                        <div
                          key={user.id}
                          className="d-flex justify-content-between align-items-center p-2 border rounded mb-1 cursor-pointer"
                          onClick={() => createNewTask(taskData, user)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
                              style={{ width: "32px", height: "32px" }}
                            >
                              {user.empName?.charAt(0).toUpperCase()}
                            </div>
                            <span className="small">{user.empName}</span>
                          </div>
                          <span className="badge bg-info text-dark">
                            {user.role}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Download */}
          <div className="position-relative" style={{ width: "100px" }}>
            <button
              onClick={() =>
                taskData.taskStatus && toggleDownloadBox(taskData.id)
              }
              className={`btn btn-sm ${
                taskData.taskStatus
                  ? "btn-outline-success"
                  : "btn-outline-secondary"
              }`}
              disabled={!taskData.taskStatus}
            >
              <FaCloudDownloadAlt />
            </button>

            {downloadBox === taskData.id && (
              <div
                className="position-absolute bg-white border rounded shadow"
                style={{ zIndex: 50 }}
              >
                <button
                  className="dropdown-item"
                  onClick={() => onDownloadHandler(taskData)}
                >
                  Combined CSV
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => onSelectedDownloadHandler(taskData)}
                >
                  Selected CSV
                </button>
              </div>
            )}
          </div>

          {/* Edit */}
          <div style={{ width: "100px" }}>
            <button
              onClick={() => {
                setTaskEditId(taskData.id);
                setTaskEdit(true);
              }}
              className="btn btn-sm btn-outline-warning"
            >
              <FaRegEdit />
            </button>
          </div>

          {/* Complete */}
          <div style={{ width: "100px" }}>
            <button
              onClick={() => completeHandler(taskData.id)}
              className="btn btn-sm btn-outline-success"
            >
              <MdOutlineTaskAlt />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminMatchingTasks;
