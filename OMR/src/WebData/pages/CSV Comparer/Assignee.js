import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import dataContext from "../../Store/DataContext";
import {
  onGetAllUsersHandler,
  onGetVerifiedUserHandler,
} from "../../services/common";
import { REACT_APP_IP } from "../../services/common";
import axios from "axios";

import { useParams } from "react-router-dom";
import API_NODE from "WebData/apiNode/apiNode";
const Assignee = () => {
  const [showModal, setShowModal] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [selectedUser, setSelectedUser] = useState({
    userId: "",
    userName: "",
  });
  const [taskValue, setTaskValue] = useState({ min: 1, max: null });
  const dataCtx = useContext(dataContext);
  const navigate = useNavigate();
  console.log(dataCtx);

  const token = JSON.parse(localStorage.getItem("userData"));
  const location = useLocation();
  const { id } = useParams();

  const [templateName, setTemplateName] = useState("");
  const state = location.state;
  useEffect(() => {
    const input = document.getElementById("templateInputName");
    input.focus();
  }, []);

  if (!state || null) {
    navigate("/admin/comparecsv", { replace: true });
  }

  useEffect(() => {
    const confirmExit = (e) => {
      // Display a confirmation message
      const confirmationMessage =
        "Are you sure you want to leave this page? Please download corrected CSV before closing this page.";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    // Add event listener when the component mounts
    window.addEventListener("beforeunload", confirmExit);

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", confirmExit);
    };
  }, []); // Empty dependency array to run effect only once on mount

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await onGetAllUsersHandler();

        setAllUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [selectedUser]);

  console.log(allUsers);


  const onTaskAssignedHandler = () => {
    const input = document.getElementById("templateInputName");
    if (
      !taskValue.max ||
      taskValue.max <= 0 ||
      taskValue.max <= taskValue.min ||
      taskValue.max > state.data
    ) {
      toast.warning("Please check your input values.");
      return;
    }

    if (!input.value) {
      input.focus();
      toast.warning("Task name cannot be empty.");
      return;
    }

    if (!selectedUser.userName || !selectedUser.userId) {
      toast.warning("Please select the assignee!");
      return;
    }
    // console.log(id,"id")
    const newAssignedTask = {
      userId: selectedUser.userId,
      min: taskValue.min,
      max: taskValue.max,
      userName: selectedUser.userName,
      templeteId: id,
      fileId: dataCtx?.fileId,
      csvFilePath: location.state.csvFile,
      correctedFilePath: location.state.correctedFilePath,
      errorFilePath: location.state.errorFilePath,
      imageDirectoryPath: location.state.imageDirectoryName,
      moduleType: "CSV Compare",
      tableName: location.state.tableName,
    };

    setAssignedUsers([...assignedUsers, newAssignedTask]);

    let newMinValue = parseInt(taskValue.max) + 1;
    if (isNaN(newMinValue)) {
      newMinValue = taskValue.min;
    }
    setTaskValue({ ...taskValue, min: newMinValue, max: "" });
    toast.success("Task successfully assigned. Thank you.");
  };
  console.log(dataCtx.fileId);

  const onTaskSubmitHandler = async () => {
    if (!(location.state.data - taskValue.min + 1 === 0)) {
      toast.warning("Please assign all rows");
      setShowModal(false);
      return;
    }

    try {
      await API_NODE.post(
        `${window.SERVER_IP}/assign`,
        { assignedUsers: assignedUsers, templateName: templateName },
        {
          headers: {
            token: token,
          },
        },
      );
      toast.success("Task assignment successful.");
      dataCtx.modifyIsLoading(false);
      navigate(`admin/comparecsv`, { replace: true });
    } catch (error) {
      console.error("Error uploading files: ", error);
      toast.error("Error submitting task. Please try again.");
    }
  };

  return (
    <div
      className="bg-primary d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="container py-4">
        <div className="card shadow-lg border-0">
          <div className="card-body">
            {/* HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
              <h3 className="fw-bold text-dark">Assign Tasks</h3>

              <div className="d-flex gap-2 mt-3 mt-md-0">
                <span className="badge mx-3 bg-primary text-white fs-6 px-3 py-2">
                  Remaining - {state && location.state.data - taskValue.min + 1}
                </span>
                <span className="badge bg-success fs-6 px-3 py-2">
                  Total - {state && location.state.data}
                </span>
              </div>
            </div>

            {/* TABLE */}
            <div className="table-responsive">
              <table className="table table-bordered align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th>Users</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Task Name</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    {/* USERS LIST */}
                    <td style={{ width: "30%" }}>
                      <div
                        className="list-group"
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {allUsers?.map((user, i) => {
                          if (currentUser.id !== user.id) {
                            return (
                              <button
                                key={i}
                                onClick={() =>
                                  setSelectedUser({
                                    ...selectedUser,
                                    userId: user.id,
                                    userName: user.empName,
                                  })
                                }
                                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                                  selectedUser.userId === user.id
                                    ? "active"
                                    : ""
                                }`}
                              >
                                {user.empName}
                              </button>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </td>

                    {/* START */}
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={taskValue.min}
                        readOnly
                        className="form-control text-center bg-light"
                      />
                    </td>

                    {/* END */}
                    <td>
                      <input
                        type="number"
                        value={taskValue.max}
                        onChange={(e) =>
                          setTaskValue({
                            ...taskValue,
                            max: e.target.value,
                          })
                        }
                        className="form-control text-center"
                      />
                    </td>

                    {/* TASK NAME */}
                    <td>
                      <input
                        type="text"
                        readOnly
                        value={templateName}
                        placeholder="Empty Name"
                        className="form-control text-center bg-light"
                      />
                    </td>

                    {/* BUTTON */}
                    <td>
                      <button
                        onClick={onTaskAssignedHandler}
                        className="btn btn-primary w-100"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BOTTOM SECTION */}
            <div className="row mt-4 g-3 align-items-center">
              {/* TASK NAME INPUT */}
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <label className="form-label fw-semibold">Task Name</label>
                    <input
                      type="text"
                      id="templateInputName"
                      placeholder="Enter Task name"
                      className="form-control"
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* PREVIEW BUTTON */}
              <div className="col-md-6 text-md-end text-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-lg text-white px-4"
                  style={{
                    background: "linear-gradient(to right, #6f42c1, #6610f2)",
                  }}
                >
                  Preview Assigned Operators
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow">
                <div className="modal-header">
                  <h5 className="modal-title">Mapped Data</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div
                  className="modal-body"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  {assignedUsers.map((assignUser, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center border rounded p-3 mb-2"
                    >
                      <strong>{assignUser.userName}</strong>
                      <span className="badge bg-success">{assignUser.min}</span>
                      <span className="badge bg-success">{assignUser.max}</span>
                    </div>
                  ))}
                </div>

                <div className="modal-footer">
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onTaskSubmitHandler}
                    className="btn btn-success"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignee;
