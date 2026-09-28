import React, { useState } from "react";

const TaskEdit = ({ taskEdit, setTaskEdit, allUsers, onEditTaskHandler }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  console.log(selectedUser);

  return (
    <div>
      {taskEdit && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          // style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div
            className="bg-white border rounded-4 p-4 p-sm-5 p-lg-5 shadow-lg mx-auto"
            style={{ maxWidth: "500px", width: "100%" }}
          >
            {/* Header */}
            <div className="d-flex align-items-center gap-3">
              <span className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white p-2">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" />
                </svg>
              </span>

              <p className="fw-medium fs-5 mb-0">Select Users</p>
            </div>

            {/* Dropdown */}
            <div className="mt-3" style={{ maxWidth: "400px" }}>
              <select
                id="userSelect"
                onChange={(e) => {
                  const selectedEmail = e.target.value;
                  const userData = allUsers.find(
                    (user) => user.empEmail === selectedEmail,
                  );

                  setSelectedUser(userData);
                }}
                className="form-select"
                multiple
              >
                {allUsers.map((user) => {
                  if (user.role !== "admin") {
                    return (
                      <option key={user.id} value={user.email}>
                        {user.empEmail}
                      </option>
                    );
                  }
                })}

              </select>
            </div>

            {/* Selected User */}
            {selectedUser && (
              <div id="selectedUsers" className="mt-4">
                <div className="p-2 rounded bg-primary bg-opacity-25">
                  {selectedUser?.empEmail}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-4 d-sm-flex gap-3">
              <button
                onClick={() => {
                  onEditTaskHandler(selectedUser);
                  console.log(selectedUser)
                  setSelectedUser(null);
                }}
                className="btn btn-primary w-100"
              >
                Confirm Selection
              </button>

              <button
                onClick={() => {
                  setTaskEdit(false);
                  setSelectedUser(null);
                }}
                className="btn btn-light text-secondary w-100 mt-2 mt-sm-0"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskEdit;
