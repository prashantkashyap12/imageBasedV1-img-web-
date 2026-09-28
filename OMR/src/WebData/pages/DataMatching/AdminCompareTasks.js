import React, { useEffect, useState } from "react";
import { MdOutlineRestartAlt } from "react-icons/md";
import { FaCloudDownloadAlt, FaRegEdit } from "react-icons/fa";
import DeactivateModal from "../../components/DeactivateModal";
import { MdOutlineTaskAlt } from "react-icons/md";
import axios from "axios";
import { onGetAllTasksHandler, onGetAllUsersHandler, REACT_APP_IP, SERVER_IP } from "../../services/common";
import API_NODE from "WebData/apiNode/apiNode";

const AdminCompareTasks = ({
  compareTask,
  onCompareTaskStartHandler,
  onCompleteHandler,
  setTaskEdit,
  setTaskEditId,
  setCompareTask,
}) => {
  const [modals, setModals] = useState(false);
  const [taskId, setTaskId] = useState(null);


  const completeHandler = async (taskId) => {
    console.log(taskId)
    const response = await API_NODE.get(
      `${window.SERVER_IP}/submitTask/${taskId}`
    );
    setCompareTask((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          return { ...task, taskStatus: true };
        }
        return task;
      })
    );

    console.log(response);
  };



 return (
  <div className="w-100" >

    {modals && (
      <DeactivateModal
        isOpen={modals}
        onClose={() => setModals(false)}
        taskId={taskId}
      />
    )}

    {compareTask?.map((taskData) => (
      <div
        key={taskData.id}
        className="d-flex align-items-center text-center border-bottom py-2 small"
        style={{ minWidth: "1100px",  }} 
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
        <div style={{ width: "80px" }}>
          {taskData.min}
        </div>

        {/* Max */}
        <div style={{ width: "80px" }}>
          {taskData.max}
        </div>

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
              taskData.taskStatus
                ? "bg-success"
                : "bg-warning text-dark"
            }`}
          >
            {taskData.taskStatus ? "Done" : "Pending"}
          </span>
        </div>

        {/* Restart */}
        <div style={{ width: "100px" }}>
          <button
            onClick={() => onCompleteHandler(taskData)}
            className={`btn btn-sm ${
              taskData.taskStatus
                ? "btn-outline-primary"
                : "btn-outline-secondary"
            }`}
            disabled={!taskData.taskStatus}
          >
            <MdOutlineRestartAlt />
          </button>
        </div>

        {/* Download */}
        <div style={{ width: "100px" }}>
          <button
            onClick={() => {
              setTaskId(taskData.id);
              setModals(true);
            }}
            className="btn btn-sm btn-outline-success"
          >
            <FaCloudDownloadAlt />
          </button>
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

    {compareTask?.length === 0 && (
      <div className="text-center text-muted">
        {/* No tasks available */}
      </div>
    )}

  </div>
);
};

export default AdminCompareTasks;