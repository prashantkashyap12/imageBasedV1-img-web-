import React from 'react';

const UserTaskDetails = ({ setIsUserTaskView, userTaskDetails }) => {

    console.log(userTaskDetails)

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.75)", zIndex: 1050 }}
        >
            <div
                className="bg-white rounded-4 shadow-lg w-100 p-4 position-relative"
                style={{ maxWidth: "900px" }}
            >

                {/* Close Button */}
                <button
                    onClick={() => setIsUserTaskView(false)}
                    className="btn btn-light position-absolute top-0 end-0 m-3 border-0"
                >
                    ✕
                </button>

                {/* Title */}
                <h4 className="fw-bold text-center mb-4">
                    User Task Details
                </h4>

                {/* Table */}
                <div
                    className="table-responsive border rounded-3"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light sticky-top">
                            <tr>
                                <th>Template ID</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Module</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {userTaskDetails?.map((data, index) => (
                                <tr key={index}>
                                    <td>{data?.templeteId}</td>
                                    <td>{data?.min}</td>
                                    <td>{data?.max}</td>
                                    <td>{data?.moduleType}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                data?.taskStatus
                                                    ? "bg-success"
                                                    : "bg-danger"
                                            }`}
                                        >
                                            {data?.taskStatus ? "Completed" : "Pending"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default UserTaskDetails;