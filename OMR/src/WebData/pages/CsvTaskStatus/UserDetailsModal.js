import React from 'react';

const UserTaskDetails = ({ setIsDetailsView, userDetails }) => {
    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.8)", zIndex: 1050 }}
        >
            <div className="bg-white rounded-4 shadow-lg w-100 p-4 position-relative"
                style={{ maxWidth: "700px" }}
            >

                {/* Close Button */}
                <button
                    onClick={() => setIsDetailsView(false)}
                    className="btn btn-light position-absolute top-0 end-0 m-3 border-0"
                >
                    ✕
                </button>

                {/* Heading */}
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
                                <th>SN</th>
                                <th>Action</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>

                        <tbody>
                            {userDetails
                                ?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map((data, index) => {
                                    const dateObject = new Date(data?.timestamp);
                                    const date = dateObject.toLocaleDateString("en-GB");
                                    const timeOptions = {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                        hour12: true,
                                    };
                                    const time = dateObject.toLocaleTimeString("en-US", timeOptions);

                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{data.action || 'Unknown Action'}</td>
                                            <td>{date || 'No description'}</td>
                                            <td>{time}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default UserTaskDetails;