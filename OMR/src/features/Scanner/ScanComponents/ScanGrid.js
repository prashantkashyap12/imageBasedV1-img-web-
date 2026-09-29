import React, { forwardRef, useMemo, useCallback, useState, useEffect } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Sort, Inject, Toolbar, Filter, Resize, VirtualScroll, } from "@syncfusion/ej2-react-grids";
import {
  emptyMessageTemplate,
  classifyCell,
  isFalseStatus,
  hasRowData,
  isMetaColumn,
  COLORS,
} from "../utils/scanUtils";

const SERVICES = [Sort, Toolbar, Filter, Resize, VirtualScroll];

const EDIT_SETTINGS = {
  allowEditing: true,
  allowAdding: true,
  allowDeleting: true,
};

const PAGE_SETTINGS = { pageSize: 50 };

// Coloured cells hide the grid's own selection colour, so mark the selected
// row with a blue top/bottom line instead.
const SELECTION_CSS = `
  .e-grid .e-rowcell.e-selectionbackground {
    box-shadow: inset 0 2px 0 #5e72e4, inset 0 -2px 0 #5e72e4;
  }
`;

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

  // Row: red when Status is FALSE.
  const rowDataBound = useCallback((args) => {
    const bad = isFalseStatus(args.data);
    Object.assign(args.row.style, {
      backgroundColor: bad ? COLORS.rowFalse : "",
      color: bad ? COLORS.rowFalseText : "",
    });
  }, []);

  // Cell: called for every rendered cell, including rows added or updated when
  // a scan result arrives through the WebSocket, so colours stay in sync.
  const queryCellInfo = useCallback((args) => {
    const field = args.column?.field;
    const style = args.cell.style;

    // always reset first (cells can be reused while scrolling / after edits)
    style.backgroundColor = "";
    style.color = "";
    if (!field) return;

    // FALSE status → the whole row is red, cell colours are not shown
    if (isFalseStatus(args.data)) {
      style.backgroundColor = COLORS.rowFalse;
      style.color = COLORS.rowFalseText;
      return;
    }

    // Empty filler rows at the bottom of the grid stay uncoloured
    if (!hasRowData(args.data)) return;

    // Only scanned answers (roll number, Q1…Qn, codes) are coloured by value
    if (isMetaColumn(field)) return;

    const color = COLORS[classifyCell(args.data?.[field])];
    if (color) style.backgroundColor = color;
  }, []);

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
    <>
      <style>{SELECTION_CSS}</style>
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
        queryCellInfo={queryCellInfo}
        rowSelected={onRowSelected}
        cellSelected={onCellSelected}
        emptyRecordTemplate={emptyMessageTemplate}
        pageSettings={PAGE_SETTINGS}
      >
        <ColumnsDirective>{columns}</ColumnsDirective>
        <Inject services={SERVICES} />
      </GridComponent>
    </>
  );
});

export default ScanGrid;