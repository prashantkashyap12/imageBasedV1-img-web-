import React, { forwardRef, useMemo, useCallback, useState, useEffect } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Sort, Inject, Toolbar, Filter, Resize, VirtualScroll, } from "@syncfusion/ej2-react-grids";
import { emptyMessageTemplate } from "../utils/scanUtils";

const SERVICES = [Sort, Toolbar, Filter, Resize, VirtualScroll];

const EDIT_SETTINGS = {
  allowEditing: true,
  allowAdding: true,
  allowDeleting: true,
};

const PAGE_SETTINGS = { pageSize: 50 };

const ScanGrid = forwardRef(function ScanGrid({ dataSource, headData, borderRowId, onRowSelected, onCellSelected, onActionComplete, onDataBound, onClick, onToolbarClick, },
  ref) {

  // Dynamic height state with a minimum of 450px
  const [gridHeight, setGridHeight] = useState(450);

  useEffect(() => {
    const updateHeight = () => {
      const windowHeight = window.innerHeight;
      const calculatedHeight = windowHeight - 280;

      setGridHeight(Math.max(450, calculatedHeight));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const rowDataBound = useCallback(
    (args) => {
      const row = args.data;

      // Reset styles
      Object.assign(args.row.style, {
        border: "",
        boxShadow: "",
        borderRadius: "",
        backgroundColor: "",
        color: "",
      });

      // Star detection: any cell contains "*"
      // const hasStar = Object.values(row).some((v) => String(v).includes("*"));
      // if (hasStar) {
      //   args.row.style.backgroundColor = "#ffcdd2"; // light red
      //   return; // skip other styling
      // }

      // if (row?.FileName === borderRowId) {
      //   args.row.style.backgroundColor = "#d4d4d4";
      //   args.row.style.borderRadius = "10px";
      // }

      // if (row?.Success === "False") {
      //   args.row.style.backgroundColor = "#f8d7da";
      //   args.row.style.color = "#721c24";
      // }

      // const hasEmpty = Object.values(row).some((v) => v === null || v === "");
      // if (!hasEmpty) return;

      Object.keys(row).forEach((key) => {
        if (row[key] === null || row[key] === "") {
          const idx = Array.from(args.row.cells).findIndex(
            (cell) => cell.column?.field === key,
          );
          if (idx !== -1) args.row.cells[idx].style.backgroundColor = "yellow";
        }
      });
    },
    [borderRowId],
  );

  const columns = useMemo(
    () =>
      headData.map((field) => (
        <ColumnDirective
          key={field}
          field={field}
          headerText={field}
          width="120"
          textAlign="Center"
        />
      )),
    [headData],
  );

  return (
    <GridComponent
      ref={ref}
      dataSource={dataSource}
      enableVirtualization={true}
      enableColumnVirtualization={true}
      height={gridHeight}
      onClick={onClick}
      dataBound={onDataBound}
      actionComplete={onActionComplete}
      allowSorting={false}
      allowFiltering={false}
      allowResizing={true}
      allowPdfExport={false}
      editSettings={EDIT_SETTINGS}
      toolbarClick={onToolbarClick}
      selectionSettings={{ mode: "Row", type: "Single" }}
      rowDataBound={rowDataBound}
      rowSelected={onRowSelected}
      cellSelected={onCellSelected}
      emptyRecordTemplate={emptyMessageTemplate}
      pageSettings={PAGE_SETTINGS}
    >
      <ColumnsDirective>{columns}</ColumnsDirective>
      <Inject services={SERVICES} />
    </GridComponent>
  );
});

export default ScanGrid;  