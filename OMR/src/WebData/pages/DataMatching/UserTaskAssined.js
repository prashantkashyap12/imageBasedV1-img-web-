import React, { useState, useEffect } from "react";
// import axios from "axios";
import { toast } from "react-toastify";

import {
  onGetTaskHandler,
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
  REACT_APP_IP,
} from "../../services/common";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers } from "helper/userManagment_helper";

const UserTaskAssined = () => {
  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [taskType, setTaskType] = useState("ALL");
  const [compareTask, setCompareTask] = useState([]);
  // const [currentTaskData, setCurrentTaskData] = useState({});
  const [os, setOs] = useState("Unknown OS");
  const [userRole, setUserRole] = useState();
  const [allusers, setAllUsers] = useState([])
  const navigate = useNavigate();

    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await fetchAllUsers();
          setAllUsers(response.result || [])
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
  
      fetchUsers();
    }, []);
    console.log(allusers);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
       const userData = JSON.parse(localStorage.getItem("userData"));
       const empid = userData?.empid;
       console.log(empid)
        setUserRole(empid);

        const currentUser = allusers.find(user => user.empId === empid);
        console.log(currentUser)
        const currentUserId = currentUser.id
        console.log(currentUserId)
        
        const tasks = await onGetTaskHandler(currentUserId);
        console.log(tasks);

        const templateData = await onGetTemplateHandler();
        const uploadTask = tasks.filter((task) => {
          return task.moduleType === "Data Entry";
        });

        const comTask = tasks.filter((task) => {
          return task.moduleType === "CSV Compare";
        });

        const updatedCompareTasks = comTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId),
          );
          if (matchedTemplate) {
            return {
              ...task,
              templateName: matchedTemplate.name,
            };
          }
          return task;
        });

        const updatedTasks = uploadTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId),
          );
          if (matchedTemplate) {
            return {
              ...task,
              templateName: matchedTemplate.name,
            };
          }
          return task;
        });
        setAllTasks(updatedTasks);
        setCompareTask(updatedCompareTasks);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUser();
  }, [allusers]);


  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    if (platform.includes("Win")) {
      setOs("Windows");
    } else if (platform.includes("Mac")) {
      setOs("macOS");
    } else if (userAgent.includes("Ubuntu")) {
      setOs("Ubuntu");
    } else if (platform.includes("Linux") || userAgent.includes("Linux")) {
      setOs("Linux");
    } else if (/Android/.test(userAgent)) {
      setOs("Android");
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      setOs("iOS");
    }
  }, []);

  const handleStartClick = (taskData) => {
    if (taskData?.taskStatus) {
      toast.warning("Task is already completed.");
      return;
    }

    if (taskData.moduleType === "Data Entry") {
      localStorage.setItem("taskdata", JSON.stringify(taskData));
      navigate(`/admin/datamatching/${taskData.id}`, { state: taskData });
    }
  };

  const onCompareTaskStartHandler = (taskdata) => {
    if (taskdata.taskStatus) {
      toast.warning("Task already completed");
      return;
    }
    localStorage.setItem("taskdata", JSON.stringify(taskdata));
    navigate("/admin/datamatching/correct_compare_csv", { state: taskdata });
  };


  const filteredTasks =
    taskType === "ALL"
      ? allTasks
      : taskType === "pending"
        ? allTasks?.filter((task) => task?.taskStatus === false)
        : taskType === "completed"
          ? allTasks?.filter((task) => task?.taskStatus === true)
          : allTasks;

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center ">
      <div className="w-100">
        <section className="container bg-white rounded shadow p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold">Assigned Tasks</h2>
          </div>

          {/* Tabs */}
          <div className="mb-3">
            <button
              onClick={() => setTaskType("ALL")}
              className={`btn me-2 ${taskType === "ALL" ? "btn-info" : "btn-outline-info"}`}
            >
              ALL TASKS
            </button>

            <button
              onClick={() => setTaskType("completed")}
              className={`btn me-2 ${taskType === "completed" ? "btn-info" : "btn-outline-info"}`}
            >
              COMPLETED
            </button>

            <button
              onClick={() => setTaskType("pending")}
              className={`btn ${taskType === "pending" ? "btn-info" : "btn-outline-info"}`}
            >
              PENDING
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive" style={{maxHeight:"400px"}}>
            <table className="table table-bordered text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>Templates</th>
                  <th>Task Name</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Module</th>
                  <th>Status</th>
                  <th>Start</th>
                </tr>
              </thead>

              <tbody style={{ overflowY: "auto" }}>
                {filteredTasks?.map((taskData) => (
                  <tr key={taskData.id}>
                    <td>{taskData.templateName}</td>
                    <td>{taskData.taskName}</td>
                    <td>{taskData.min}</td>
                    <td>{taskData.max}</td>

                    <td>
                      <span className="badge bg-secondary">
                        {taskData.moduleType}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          taskData.taskStatus
                            ? "bg-success"
                            : "bg-warning text-white"
                        }`}
                      >
                        {taskData.taskStatus ? "Completed" : "Pending"}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => handleStartClick(taskData)}
                        disabled={loadingTaskId === taskData.id}
                        className="btn btn-primary btn-sm"
                      >
                        {loadingTaskId === taskData.id ? "Loading..." : "Start"}
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Compare Tasks */}
                {compareTask?.map((taskData) => (
                  <tr key={taskData.id}>
                    <td>{taskData.templateName}</td>
                    <td>{taskData.taskName}</td>
                    <td>{taskData.min}</td>
                    <td>{taskData.max}</td>

                    <td>
                      <span className="badge bg-warning text-white">
                        {taskData.moduleType}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          taskData.taskStatus
                            ? "bg-success text-white"
                            : "bg-warning text-white"
                        }`}
                      >
                        {taskData.taskStatus ? "Completed" : "Pending"}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => onCompareTaskStartHandler(taskData)}
                        disabled={loadingTaskId === taskData.id}
                        className="btn btn-primary btn-sm"
                      >
                        {loadingTaskId === taskData.id ? "Loading..." : "Start"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserTaskAssined;
