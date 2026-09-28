import React, { useEffect, useState } from "react";
import {
  onGetAllTasksHandler,
  onGetTemplateHandler,
  onGetAllUsersHandler,
} from "../../services/common";
import axios from "axios";
import { toast } from "react-toastify";
import AdminMatchingTasks from "./AdminMatchingTasks";
import AdminCompareTasks from "./AdminCompareTasks";
import TaskEdit from "./TaskEdit";
import { useNavigate } from "react-router-dom";
import API_NODE from "WebData/apiNode/apiNode";
import fetchApi from "WebData/fetchApi/fetchApi";

const AdminAssined = () => {
  const [compareTask, setCompareTask] = useState([]);
  const [matchingTask, setMatchingTask] = useState([]);
  const token = JSON.parse(localStorage.getItem("userData"));
  const [taskEdit, setTaskEdit] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [taskEditId, setTaskEditId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [taskType, setTaskType] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [taskstatus, settaskstatus] = useState();
  const navigate = useNavigate();
  const [downloadBox, setdownloadBox] = useState(null);

  useEffect(() => {
    if (!allUsers?.length) return; // ✅ early exit

    const fetchCurrentUser = async () => {
      try {
        const { data } = await API_NODE.get(
          `${window.SERVER_IP}/assignedTasks`,
        );

        const AssignedData = data.assignedData || [];

        // ✅ Create lookup map once
        const userMap = new Map(
          allUsers.map(({ id, empName }) => [String(id), empName]),
        );

        // ✅ Single loop (filter + map merged)
        const finalData = [];

        for (const task of AssignedData) {
          if (task.moduleType !== "CSV Compare") continue;

          const empName = userMap.get(String(task.userId));
          if (!empName) continue;

          finalData.push({
            ...task,
            userName: empName,
          });
        }

        setCompareTask(finalData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchCurrentUser();
  }, [allUsers]);

  useEffect(() => {
    const onFetchTasksData = async () => {
      try {
        const tasks = await onGetAllTasksHandler();
        const templateData = await onGetTemplateHandler();
        const users = await onGetAllUsersHandler();

        setAllUsers(users);

        const uploadTask = tasks.filter(
          (task) => task.moduleType === "Data Entry",
        );

        const updatedTasks = uploadTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId),
          );

          const matchedUser = users.find(
            (user) => user.id === parseInt(task.userId),
          );

          // Create a new task object with existing task properties
          const updatedTask = { ...task };

          // Add userName if matchedUser is found
          if (matchedUser) {
            updatedTask.userName = matchedUser.empName;
          }

          // Add templateName if matchedTemplate is found
          if (matchedTemplate) {
            updatedTask.templateName = matchedTemplate.name;
          }

          // Return the updated task
          return updatedTask;
        });

        setMatchingTask(updatedTasks);
      } catch (error) {
        console.error("Error fetching tasks data:", error);
      }
    };

    onFetchTasksData();
  }, []);

  // console.log(matchingTask);

  const convertToCsv = (jsonData) => {
    const headers = Object.keys(jsonData[0]);
    const csvHeader = headers.join(",") + "\n";
    const csvData = jsonData
      .map((obj) => {
        return headers.map((key) => obj[key]).join(",");
      })
      .join("\n");
    return csvHeader + csvData;
  };

  const onCompareTaskStartHandler = (taskData) => {
    const sendReq = async () => {
      try {
        const response = await API_NODE.get(
          `${window.SERVER_IP}/download_error_file/${taskData.id}`,
        );
        const jsonObj = response.data.csvFile;
        const csvData = convertToCsv(jsonObj);
        const blob = new Blob([csvData], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        const date = new Date().toJSON();
        link.download = `data_${date}.csv`;
        link.click();
      } catch (err) {
        console.log(err);
      }
    };
    sendReq();
    // console.log(taskData);
  };

  const onDownloadHandler = async (currentTaskData) => {
    if (!currentTaskData.taskStatus) {
      toast.warning("The task is pending, so downloading is not available.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetchApi(
        `${window.SERVER_IP}/download/csv/${currentTaskData.id}`,
        {
          method: "GET",
        },
      );

      // console.log(response)
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // console.log(response);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract the filename from the response headers if provided
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = currentTaskData?.taskName;
      if (
        contentDisposition &&
        contentDisposition.indexOf("attachment") !== -1
      ) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setdownloadBox(null);
    } catch (error) {
      console.error("Error downloading the file:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSelectedDownloadHandler = async (currentTaskData) => {
    try {
      setLoading(true);

      const response = await fetchApi(
        `${window.SERVER_IP}/download/separatecsv/${currentTaskData.id}`,
        {
          method: "GET",
        },
      );
      // console.log(
      //   response.headers.get("x-incomplete-tasks"),
      //   response.headers.get("x-incomplete-count"),
      // );
      // Handle failed responses (server returns JSON error)
      if (!response.ok) {
        let errorMessage = "Download failed.";
        try {
          const data = await response.json();
          errorMessage = data.message || data.error || errorMessage;
        } catch (_) {}
        toast.error(errorMessage);
        return;
      }

      // ✅ Check warning headers (use lowercase keys)
      const hasWarning = response.headers.get("x-incomplete-tasks");
      if (hasWarning === "true") {
        const count = response.headers.get("x-incomplete-count") || 0;
        toast.warning(
          `⚠ Warning: ${count} task(s) are incomplete. CSV will still be downloaded.`,
          { autoClose: 10000 },
        );
      }

      // Proceed to download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from headers (lowercase key)
      const contentDisposition = response.headers.get("content-disposition");
      let filename = currentTaskData?.taskName || "download.csv";

      if (
        contentDisposition &&
        contentDisposition.toLowerCase().includes("attachment")
      ) {
        let match =
          /filename\*=(?:UTF-8'')?([^;]+)/i.exec(contentDisposition) ||
          /filename="?([^;"\n]+)"?/i.exec(contentDisposition);

        if (match && match[1]) {
          try {
            filename = decodeURIComponent(match[1].replace(/['"]/g, ""));
          } catch {
            filename = match[1].replace(/['"]/g, "");
          }
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);
      setdownloadBox(null);
    } catch (error) {
      console.error("Error downloading the file:", error);
      toast.error("Something went wrong during download.");
    } finally {
      setLoading(false);
    }
  };

  const onCompleteHandler = async (currentTask) => {
    // console.log(currentTask);
    try {
      const data = await API_NODE.post(
        `${window.SERVER_IP}/taskupdation/${parseInt(currentTask.id)}`,
        { taskStatus: false },
        {
          headers: {
            token: token,
          },
        },
      );
      // console.log(data.data);
      settaskstatus(data.data);
      const updatedTasks = compareTask.map((task) => {
        if (task.id === currentTask.id) {
          return { ...task, taskStatus: false };
        }
        return task;
      });
      setCompareTask(updatedTasks);
      toast.success("Task status updated.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onEditTaskHandler = async (user) => {
    if (!user) {
      toast.warning("Please select the user.");
      return;
    }

    try {
      // const token = JSON.parse(localStorage.getItem("userData"));
      await API_NODE.post(`${window.SERVER_IP}/edit/assigned/task`, {
        assignedTaskId: taskEditId,
        userId: user.id,
      });

      const updatedTasks = matchingTask.map((task) => {
        if (task.id === taskEditId) {
          const taskData = {
            ...task,
            userName: user.userName,
            // userName: user.empName,
          };
          return taskData;
        }
        return task;
      });

      setMatchingTask(updatedTasks);
      toast.success("Task updated successfully.");
      setTaskEditId("");
      setTaskEdit(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="vh-100 w-100 d-flex justify-content-center align-items-center pt-5">
      <div>
        <section className="container bg-white rounded shadow pt-3">
          {/* Header */}
          <div className="d-flex justify-content-end mb-3">
            <button
              className="btn btn-outline-primary"
              onClick={() =>
                navigate("/admin/datamatching/csvtaskstatus", {
                  replace: true,
                })
              }
            >
              Find Task Status
            </button>
          </div>

          {/* Filters */}
          <div className="mb-3 d-flex align-items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setTaskType("All");
                setSelectedDate("");
              }}
              className={`btn ${taskType === "All" ? "btn-info" : "btn-outline-info"}`}
            >
              ALL TASKS
            </button>

            <button
              onClick={() => {
                setTaskType("completed");
                setSelectedDate("");
              }}
              className={`btn ${taskType === "completed" ? "btn-info" : "btn-outline-info"}`}
            >
              COMPLETED
            </button>

            <button
              onClick={() => {
                setTaskType("pending");
                setSelectedDate("");
              }}
              className={`btn ${taskType === "pending" ? "btn-info" : "btn-outline-info"}`}
            >
              PENDING
            </button>

            <input
              type="date"
              className="form-control w-auto"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setTaskType("");
              }}
            />
          </div>

          {/* Table Header Only */}
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "120px" }}>Template</th>
                  <th style={{ width: "120px" }}>Assignee</th>
                  <th style={{ width: "140px" }}>Task Name</th>
                  <th style={{ width: "80px" }}>Min</th>
                  <th style={{ width: "80px" }}>Max</th>
                  <th style={{ width: "120px" }}>Module</th>
                  <th style={{ width: "120px" }}>Status</th>
                  <th style={{ width: "100px" }}>Reassign</th>
                  <th style={{ width: "100px" }}>Download</th>
                  <th style={{ width: "100px" }}>Edit</th>
                  <th style={{ width: "100px" }}>Complete</th>
                </tr>
              </thead>
            </table>

            {/* Data Section */}
            <div
              className="border border-top-0 rounded-bottom overflow-auto "
              style={{ maxHeight: "350px", minHeight: "250px" }}
            >
              <AdminCompareTasks
                onCompleteHandler={onCompleteHandler}
                compareTask={compareTask}
                onCompareTaskStartHandler={onCompareTaskStartHandler}
                setCompareTask={setCompareTask}
                setTaskEditId={setTaskEditId} // ✅ ADD THIS
                setTaskEdit={setTaskEdit}
              />

              <AdminMatchingTasks
                onCompleteHandler={onCompleteHandler}
                setTaskEdit={setTaskEdit}
                matchingTask={matchingTask}
                setMatchingTask={setMatchingTask}
                onDownloadHandler={onDownloadHandler}
                setTaskEditId={setTaskEditId}
                taskType={taskType}
                selectedDate={selectedDate}
                taskStatus={taskstatus}
                onSelectedDownloadHandler={onSelectedDownloadHandler}
                setdownloadBox={setdownloadBox}
                downloadBox={downloadBox}
              />
            </div>
          </div>

          {/* Modal */}
          <TaskEdit
            taskEdit={taskEdit}
            setTaskEdit={setTaskEdit}
            allUsers={allUsers}
            onEditTaskHandler={onEditTaskHandler}
          />
        </section>

        {/* Loader */}
        {loading && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50">
            <div className="spinner-border text-light" role="status"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssined;
