import React from 'react'
import { FaAngleDoubleLeft } from "react-icons/fa";

const TaskUsersDetails = ({
    csvDetails,
    setOpenDetails,
    selectedHeader,
    headerValue,
    onGetUserDetailsHandler,
    onGetUserTaskDetailsHandler
}) => {

    const hasUserDetailsKey = csvDetails && csvDetails?.some((item) => item.hasOwnProperty('User Details'));
    const userDetailCounts = {};
    // console.log(hasUserDetailsKey)
    // console.log(userDetailCounts)
    let uncompletedDataCount = 0;

    csvDetails?.forEach((item) => {
        const userDetailValue = item['User Details'];
        if (!userDetailValue) {
            uncompletedDataCount += 1;
        } else {
            if (userDetailCounts[userDetailValue]) {
                userDetailCounts[userDetailValue] += 1;
            } else {
                userDetailCounts[userDetailValue] = 1;
            }
        }
    });

    
    return (
        <div className="min-vh-100 d-flex justify-content-center align-items-center bg-primary bg-gradient">
            <div className="container">
                <div className="card shadow-lg rounded-4 p-4">

                    {/* Back Button */}
                    <div className="mb-3">
                        <FaAngleDoubleLeft
                            className="fs-3 cursor-pointer"
                            style={{ cursor: "pointer" }}
                            onClick={() => setOpenDetails(false)}
                        />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">CSV Data Overview</h2>
                        <p className="text-muted mb-0">
                            Showing header for <span className="fw-semibold text-primary">{selectedHeader}</span> with code{" "}
                            <span className="fw-semibold text-primary">{headerValue}</span>
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="row g-3 text-center mb-4">

                        <div className="col-md-6 col-lg-3">
                            <div className="card border-0 shadow-sm bg-light p-3">
                                <div className="text-muted small">Header</div>
                                <div className="fs-4 fw-bold text-primary">{selectedHeader}</div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card border-0 shadow-sm bg-light p-3">
                                <div className="text-muted small">Header Value</div>
                                <div className="fs-4 fw-bold text-primary">{headerValue}</div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card border-0 shadow-sm bg-light p-3">
                                <div className="text-muted small">Total Records</div>
                                <div className="fs-4 fw-bold text-primary">{csvDetails?.length}</div>
                            </div>
                        </div>

                        <div className="col-md-6 col-lg-3">
                            <div className="card border-0 shadow-sm bg-light p-3">
                                <div className="text-muted small">Completed Data</div>
                                {hasUserDetailsKey ? (
                                    <div className="fs-4 fw-bold text-success">
                                        {csvDetails?.length - uncompletedDataCount}
                                    </div>
                                ) : (
                                    <div className="small fw-bold text-warning">
                                        Task Not started yet
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Table Section */}
                    <div>
                        <h5 className="fw-semibold mb-3">CSV Data Details</h5>

                        <div className="table-responsive" style={{ maxHeight: "350px", overflowY: "auto" }}>
                            <table className="table table-bordered table-hover align-middle text-center">
                                <thead className="table-primary">
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Total Updated</th>
                                        <th>User Details</th>
                                        <th>Tasks</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {Object.entries(userDetailCounts).map(([userDetail, count], idx) => (
                                        <tr key={idx}>
                                            <td className="text-start">
                                                {userDetail?.split(':')[0]}
                                            </td>

                                            <td>
                                                {userDetail?.split(':')[1]}
                                            </td>

                                            <td>
                                                <span className="badge bg-success">
                                                    {count}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    onClick={() => onGetUserDetailsHandler(userDetail?.split(':')[1])}
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    Details →
                                                </button>
                                            </td>

                                            <td>
                                                <button
                                                    onClick={() => onGetUserTaskDetailsHandler(userDetail?.split(':')[1])}
                                                    className="btn btn-outline-dark btn-sm"
                                                >
                                                    Tasks →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default TaskUsersDetails;