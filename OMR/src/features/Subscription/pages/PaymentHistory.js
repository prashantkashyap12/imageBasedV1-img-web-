import React, { useState } from "react";
import { GrFormNext } from "react-icons/gr";
import { IoIosArrowBack } from "react-icons/io";

const PaymentHistory = ({ historyData = [], activePlan }) => {
  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust this number to control rows per page

  // 2. Pagination Calculations
  const totalItems = historyData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice array for the current view
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);

  // Helper function to render correct Bootstrap 4.6 badge status
  const renderStatusBadge = (status) => {
    const normalizedStatus = status?.toUpperCase();

    switch (normalizedStatus) {
      case "PAID":
      case "SUCCESS":
        return (
          <span className="badge badge-pill badge-success px-3 py-1.5">
            Paid
          </span>
        );
      case "FAILED":
        return (
          <span className="badge badge-pill badge-danger px-3 py-1.5">
            Failed
          </span>
        );
      case "PENDING":
        return (
          <span className="badge badge-pill badge-warning text-dark px-3 py-1.5">
            Pending
          </span>
        );
      default:
        return (
          <span className="badge badge-pill badge-secondary px-3 py-1.5">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container pt-4 mt-7 bg-white rounded shadow-sm">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h2 font-weight-bold mb-1 text-dark">
            Payment History
          </h2>

        </div>
        <div className="text-right">
          <span className="text-muted d-block" style={{ fontSize: "0.8rem" }}>
            Current Plan
          </span>
          <span className="badge badge-primary px-3 py-2">{activePlan.currentPackage}</span>
        </div>
      </div>

      {/* Table Card Wrapper */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="thead-light">
                <tr>
                  <th scope="col" className="border-0 pl-4">
                    Transaction ID
                  </th>
                  <th scope="col" className="border-0">
                    Date
                  </th>
                  <th scope="col" className="border-0">
                    Amount
                  </th>
                  <th scope="col" className="border-0">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((txn, index) => (
                    <tr
                      key={txn.id || txn.TransactionId || index}
                      className="payment-row"
                      style={{ transition: "background-color 0.2s" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8f9fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td className="pl-4 py-3">
                        <span className="font-weight-bold text-dark d-block">
                          {txn.TransactionId}
                        </span>
                        <span
                          className="text-muted d-block"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {txn.PaymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-black align-middle">
                        {txn.CreatedDate}
                      </td>
                      <td className="py-3 font-weight-bold text-dark align-middle">
                        {txn.Amount}
                      </td>
                      <td className="py-3 align-middle">
                        {renderStatusBadge(txn.PaymentStatus)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Clean Prev / Next Pagination Footer */}
        {totalItems > 0 && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3 border-top">
            <div
              className="d-inline-flex align-items-center justify-content-center px-3 py-1.5 bg-primary border rounded text-secondary font-weight-bold mx-2"
              style={{ minWidth: "60px", fontSize: "0.9rem" }}
            >
              <span>
                {currentPage}
                <span style={{ fontSize: "1.2rem" }}>/</span>
                {totalPages}
              </span>
            </div>
            {totalPages > 1 && (
              <nav aria-label="Page navigation">
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <IoIosArrowBack />
                    </button>
                  </li>

                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <GrFormNext />
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
