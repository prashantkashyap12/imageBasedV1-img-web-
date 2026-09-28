import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MdDelete } from "react-icons/md";

const DuplicateDataModel = ({
  showDuplicateField,
  cancelButtonRef,
  setShowDuplicateField,
  columnName,
  allCurrentData,
  onEditModalHandler,
  onRemoveDuplicateHandler,
}) => {
  return (
    <Transition.Root show={showDuplicateField} as={Fragment}>
      <Dialog
        as="div"
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ zIndex: 1050 }}
        initialFocus={cancelButtonRef}
        onClose={setShowDuplicateField}
      >
        {/* BACKDROP */}
        <Transition.Child as={Fragment}>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          ></div>
        </Transition.Child>

        {/* MODAL */}
        <div className="d-flex justify-content-center align-items-center w-100 h-100">
          <Transition.Child as={Fragment}>
            <Dialog.Panel className="modal-content rounded-4 shadow-lg w-100"
              style={{ maxWidth: "700px" }}
            >
              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {columnName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDuplicateField(false)}
                ></button>
              </div>

              {/* BODY */}
              <div
                className="modal-body"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <table className="table table-bordered table-hover align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>{columnName}</th>
                      <th>Row Index</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allCurrentData &&
                      allCurrentData.map((data, index) => (
                        <tr key={index}>
                          <td className="fw-medium">
                            {data[columnName]}
                          </td>

                          <td>{data.id}</td>

                          <td>
                            <button
                              onClick={() =>
                                onEditModalHandler(data.id)
                              }
                              className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            >
                              Edit
                            </button>

                            {/* DELETE (optional uncomment) */}
                            {/* 
                            <button
                              onClick={() =>
                                onRemoveDuplicateHandler(
                                  index,
                                  data.index,
                                  data.row[columnName]
                                )
                              }
                              className="btn btn-outline-danger btn-sm ms-2"
                            >
                              <MdDelete />
                            </button> 
                            */}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDuplicateField(false)}
                >
                  Close
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default DuplicateDataModel;