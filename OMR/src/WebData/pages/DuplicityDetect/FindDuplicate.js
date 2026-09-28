import React, { useEffect, useState } from "react";
import { fetchHeadersInDuplicate } from "../../services/common";
import { useNavigate, useParams } from "react-router-dom";

const FindDuplicate = ({
  csvHeaders,
  imageNames,
  onFindDuplicatesHandler,
  onDuplicateCheckedHandler,
  duplicateCheckedData,
}) => {
  const [headers, setHeaders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("fileId"));
    async function fetchData() {
      const response = await fetchHeadersInDuplicate(data.templeteId);
      setHeaders(response.headers);
    }
    fetchData();
  }, []);

  const navigateHandler = () => {
    const data = JSON.parse(localStorage.getItem("fileId"));
    navigate(`/admin/csvuploader/fieldDecision/${data.templeteId}`);
  };

  const editNavigateHandler = () => {
    const data = JSON.parse(localStorage.getItem("fileId"));
    navigate(`/admin/csvuploader/templatemap/${id}`);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light" style={{width:"100%"}}>
      <div className="container">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold mb-0">Find Duplicates</h3>
            </div>

            {/* TABLE */}
            <div className="table-responsive" style={{ maxHeight: "500px" }}>
              <table className="table table-hover align-middle">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Header Name</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {headers?.map((columnName, index) =>
                    columnName === "Previous Values" ||
                    columnName === "Updated Values" ||
                    columnName === "User Details" ||
                    columnName === "Updated Col. Name" ||
                    imageNames?.includes(columnName) ? null : (
                      <tr key={index}>
                        <td className="fw-semibold">{columnName}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-primary btn-sm px-3 rounded-pill"
                            onClick={() => onFindDuplicatesHandler(columnName)}
                          >
                            Check
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER BUTTON */}
            <div className="text-end mt-3">
              <button
                onClick={() => {
                  onDuplicateCheckedHandler();
                  setShowModal(true);
                }}
                className="btn btn-success px-4 rounded-pill"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Already Mapped Data</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div
                className="modal-body"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {duplicateCheckedData?.records?.length > 0 ? (
                  <table className="table table-sm table-bordered">
                    <tbody>
                      {duplicateCheckedData.records.map((data, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{data?.key}</td>
                          <td>{data?.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-muted mt-3">
                    No records found.
                  </p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={editNavigateHandler}
                >
                  Edit
                </button>
                <button className="btn btn-success" onClick={navigateHandler}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDuplicate;
