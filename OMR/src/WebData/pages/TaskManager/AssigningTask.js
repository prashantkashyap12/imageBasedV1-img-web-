import React, { useEffect, useState } from "react";
import { getTotalCSVData } from "../../services/common";

const AssigningTask = ({
  allUsers,
  setSelectedUser,
  selectedUser,
  taskValue,
  setTaskValue,
  onTaskAssignedHandler,
  totalData,
  setTaskName,
  taskName,
}) => {
  const [remaingData, setRemaingData] = useState(0);
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setRemaingData(totalData);
  });

  const handleCheckboxChange = (userId, userName) => {
    const existingIndex = selectedUser.findIndex(
      (data) => data.userId === userId
    );

    if (existingIndex !== -1) {
      const filteredData = [...selectedUser];
      filteredData.splice(existingIndex, 1);
      setSelectedUser(filteredData);
    } else {
      setSelectedUser((prev) => [
        ...prev,
        { userId: userId, userName: userName },
      ]);
    }
  };

 return (
  <>
    {/* HEADER */}
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
      <h3 className="fw-bold mb-0">Assign Tasks</h3>

      <div className="card border-0 shadow-sm p-3">
        <div className="d-flex flex-wrap align-items-end">

          {/* Task Name */}
          <div>
            <label className="fw-semibold me-2">Task Name</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name..."
              className="form-control form-control-sm"
              style={{ minWidth: "200px" }}
            />
          </div>

          {/* Remaining Data */}
          <span className="badge bg-primary text-white fs-6 px-3 mx-3 py-2">
            Remaining:{" "}
            {remaingData - taskValue.max > 0
              ? remaingData - taskValue.max - taskValue.min + 1
              : 0}
          </span>

          {/* Total Data */}
          <span className="badge bg-success fs-6 px-3 py-2">
            Total: {totalData || 0}
          </span>
        </div>
      </div>
    </div>

    {/* TABLE */}
    <div className="card shadow-sm border-0">
      <div className="card-body p-0">
        <div className="table-responsive">

          <table className="table table-bordered align-middle mb-0">
            <thead className="table-light text-center">
              <tr>
                <th style={{ width: "50%" }}>Users</th>
                <th>Min</th>
                <th>Max</th>
                <th>Task</th>
              </tr>
            </thead>

            <tbody>
              <tr>

                {/* USERS */}
                <td>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {allUsers?.map((user, i) => {
                      if (user.role !== "admin") {
                        return (
                          <div
                            key={i}
                            className="form-check d-flex align-items-center px-3 ml-2 py-2 border-bottom hover-row"
                          >
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={selectedUser.some(
                                (data) => data.userId === user.id
                              )}
                              onChange={() =>
                                handleCheckboxChange(
                                  user.id,
                                  user.empName
                                )
                              }
                              id={`userId-${user.id}`}
                            />
                            <label
                              htmlFor={`userId-${user.id}`}
                              className="form-check-label fw-medium"
                            >
                              {user.empName}
                            </label>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </td>

                {/* MIN */}
                <td className="text-center">
                  <input
                    type="number"
                    min="1"
                    value={taskValue.min}
                    readOnly
                    className="form-control text-center"
                    style={{ width: "80px", margin: "auto" }}
                  />
                </td>

                {/* MAX */}
                <td className="text-center">
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
                    style={{ width: "80px", margin: "auto" }}
                  />
                </td>

                {/* BUTTON */}
                <td className="text-center">
                  <button
                    onClick={onTaskAssignedHandler}
                    className="btn btn-primary px-4 rounded-pill"
                  >
                    Assign
                  </button>
                </td>

              </tr>
            </tbody>

          </table>

        </div>
      </div>
    </div>
  </>
);
};

export default AssigningTask;
