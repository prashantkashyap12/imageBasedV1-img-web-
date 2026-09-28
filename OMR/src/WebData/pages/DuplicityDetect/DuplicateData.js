import DuplicateDataModel from "./DuplicateDataModel";

const DuplicateData = ({
  duplicatesData,
  columnName,
  onShowModalHandler,
  showDuplicateField,
  cancelButtonRef,
  setShowDuplicateField,
  allCurrentData,
  onEditModalHandler,
  onRemoveDuplicateHandler,
}) => {
  console.log(duplicatesData);

  return (
    <div className="card shadow-sm border-0 rounded-4 h-100">
      <div className="card-body">

        {/* HEADER */}
        <div className="row text-center mb-3">
          <div className="col-6">
            <h6 className="fw-bold mb-1">Duplicates</h6>
            <span className="text-primary fw-semibold">
              {duplicatesData?.length}
            </span>
          </div>

          <div className="col-6">
            <h6 className="fw-bold mb-1">Field</h6>
            <span className="text-primary fw-semibold">
              {columnName}
            </span>
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="row fw-bold text-center border-bottom py-2 bg-light">
          <div className="col-4">{columnName}</div>
          <div className="col-4">Duplicates</div>
          <div className="col-4">Action</div>
        </div>

        {/* DATA LIST */}
        <div
          className="mt-2"
          style={{ maxHeight: "40vh", overflowY: "auto" }}
        >
          {duplicatesData?.map((data, index) => (
            <div
              key={index}
              className="row text-center align-items-center py-2 border-bottom"
            >
              <div className="col-4 fw-medium text-break">
                {data[columnName]}
              </div>

              <div className="col-4 fw-medium">
                {data.count}
              </div>

              <div className="col-4">
                <button
                  onClick={() =>
                    onShowModalHandler(data, index, columnName)
                  }
                  className="btn btn-primary btn-sm rounded-pill px-3"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showDuplicateField && (
        <DuplicateDataModel
          showDuplicateField={showDuplicateField}
          cancelButtonRef={cancelButtonRef}
          setShowDuplicateField={setShowDuplicateField}
          columnName={columnName}
          allCurrentData={allCurrentData}
          onEditModalHandler={onEditModalHandler}
          onRemoveDuplicateHandler={onRemoveDuplicateHandler}
        />
      )}
    </div>
  );
};

export default DuplicateData;