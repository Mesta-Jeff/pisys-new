
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect, useMemo, useRef } from "react";

const PiSysTable = ({
  data,
  actions = null,
  selectable = false,
  onSelectionChange,
  idField = "id",
  showExportButtons = false,
  renderAsHTML = false,
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedRows, setSelectedRows] = useState([]);
  const selectAllCheckboxRef = useRef();
  const [selectAllTriggered, setSelectAllTriggered] = useState(false);
  const exportButtons = showExportButtons === false ? [] : showExportButtons;

  // columns from the data
  const columns = useMemo(() => {
    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    return [];
  }, [data]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.some((column) =>
        String(row[column] || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data, columns]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(startEntry + itemsPerPage - 1, filteredData.length);

  const shouldHideColumn = (colIdx) => {
    if (windowWidth < 576) return colIdx >= 2;
    if (windowWidth < 992) return colIdx >= 4;
    return false;
  };

  const getHiddenColumns = () => {
    if (windowWidth < 576) return columns.slice(2);
    if (windowWidth < 992) return columns.slice(4);
    return [];
  };

  const isRowSelected = (row) => {
    return selectedRows.some((selectedRow) => {
      if (idField && row[idField] && selectedRow[idField]) {
        return row[idField] === selectedRow[idField];
      }
      return JSON.stringify(row) === JSON.stringify(selectedRow);
    });
  };

  const handleSelectRow = (row) => {
    setSelectedRows((prev) => {
      if (isRowSelected(row)) {
        return prev.filter((item) => {
          if (idField && row[idField] && item[idField]) {
            return item[idField] !== row[idField];
          }
          return JSON.stringify(item) !== JSON.stringify(row);
        });
      }
      return [...prev, row];
    });
    setSelectAllTriggered(false);
  };

  const handleSelectAll = () => {
    setSelectAllTriggered(true);
    const pageRows = paginatedData;
    const allSelected = pageRows.every((row) => isRowSelected(row));

    if (allSelected) {
      setSelectedRows((prev) =>
        prev.filter((selectedRow) =>
          !pageRows.some((row) => {
            if (idField && row[idField] && selectedRow[idField]) {
              return row[idField] === selectedRow[idField];
            }
            return JSON.stringify(row) === JSON.stringify(selectedRow);
          })
        )
      );
    } else {
      const newSelections = pageRows.filter((row) => !isRowSelected(row));
      setSelectedRows([...selectedRows, ...newSelections]);
    }
  };

  useEffect(() => {
    if (selectAllCheckboxRef.current && paginatedData) {
      const pageItems = paginatedData;
      const someSelected = pageItems.some((row) => isRowSelected(row));
      const allSelected = selectAllTriggered
        ? pageItems.every((row) => isRowSelected(row))
        : false;
      selectAllCheckboxRef.current.checked = allSelected;
      selectAllCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [paginatedData, selectedRows, isRowSelected, selectAllTriggered]);

  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const toggleExpandRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleExportCSV = () => {
    const csvContent = [
      columns.join(","),
      ...filteredData.map((row) =>
        columns.map((col) => `"${row[col]}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "export.csv");
    link.click();
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="page-number"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="page-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`page-number ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="page-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="page-number"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  const shouldRenderAsHTML = (column) => {
    if (typeof renderAsHTML === 'boolean') {
      return renderAsHTML;
    } else if (typeof renderAsHTML === 'object' && renderAsHTML !== null) {
      return !!renderAsHTML[column];
    }
    return false;
  };

  return (
    <div className="custom-table-container">
      <div className="table-controls">
        <div className="top-label">
          <label>
            Show{" "}
            <select value={itemsPerPage} onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="form-select form-select-sm d-inline-block" style={{ width: "80px" }} >
              {[5, 10, 25, 50].map((size) => (
                <option key={size} value={size}> {size} </option>
              ))}
            </select>{" "}
            entries
          </label>
        </div>

        <div className="bottom-controls">
          <div className="left-controls">

            {/* Only render export buttons if exportButtons is not empty */}
            {exportButtons.length > 0 && (
              <div className="export-buttons">
                {exportButtons.includes("excel") && (
                  <button className="btn btn-outline-secondary btn-sm me-1">
                    <i className="uil-file-exclamation-alt"></i> Excel
                  </button>
                )}
                {exportButtons.includes("pdf") && (
                  <button className="btn btn-outline-secondary btn-sm me-1">
                    <i className="uil-file-exclamation-alt"></i> PDF
                  </button>
                )}
                {exportButtons.includes("csv") && (
                  <button onClick={handleExportCSV} className="btn btn-outline-secondary btn-sm me-1" >
                    <i className="uil-file-exclamation-alt"></i> CSV
                  </button>
                )}
                {exportButtons.includes("print") && (
                  <button className="btn btn-outline-secondary btn-sm">
                    <i className="uil-print"></i> Print
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="right-controls">
            <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="search-input" />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-centered mb-0">
          <thead>
            <tr>
              {selectable && (
                <th style={{ width: "40px" }}>
                  <input type="checkbox" onChange={handleSelectAll} ref={selectAllCheckboxRef} />
                </th>
              )}
              {windowWidth < 992 && <th style={{ width: "40px" }}></th>}
              {columns.map((col, colIdx) => (
                <th  key={`col-${colIdx}`} style={{ display: shouldHideColumn(colIdx) ? "none" : undefined }} >
                  {col} <i className="mdi mdi-sort-ascending"></i>
                </th>
              ))}
              {actions && (
                <th style={{ display: windowWidth < 992 ? "none" : undefined }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => {
                const rowKey = idField && row[idField] ? `row-${row[idField]}` : `row-${idx}`;
                return (
                  <React.Fragment key={rowKey}>
                    <tr>
                      {selectable && (
                        <td style={{ width: "40px" }}>
                          <input type="checkbox" checked={isRowSelected(row)} onChange={() => handleSelectRow(row)} />
                        </td>
                      )}
                      {windowWidth < 992 && (
                        <td style={{ width: "40px" }}>
                          <button onClick={() => toggleExpandRow(idx)} className="btn btn-sm btn-light" >
                            {expandedRows.includes(idx) ? "-" : "+"}
                          </button>
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td key={`cell-${rowKey}-${colIdx}`} style={{ display: shouldHideColumn(colIdx) ? "none" : undefined, }} >
                          {shouldRenderAsHTML(col) ? (
                            <div dangerouslySetInnerHTML={{ __html: row[col] }} />
                          ) : (
                            row[col]
                          )}
                        </td>
                      ))}
                      {actions && (
                        <td style={{ display: windowWidth < 992 ? "none" : undefined, }} >
                          {actions(row, idx)}
                        </td>
                      )}
                    </tr>

                    {expandedRows.includes(idx) && (
                      <tr className="d-lg-none">
                        <td colSpan={columns.length + (selectable ? 2 : 1)}>
                          <div className={`expandable-row ${expandedRows.includes(idx) ? "show" : "" }`} >
                            {getHiddenColumns().map((col, colIdx) => (
                              <div key={`exp-col-${colIdx}`} style={{ marginBottom: "5px" }}>
                                <strong>{col}:</strong>{" "}
                                {shouldRenderAsHTML(col) ? (
                                  <div dangerouslySetInnerHTML={{ __html: row[col] }} />
                                ) : (
                                  row[col]
                                )}
                              </div>
                            ))}
                            {actions && (
                              <div style={{ marginTop: "10px" }}>
                                <strong>Actions:</strong> {actions(row, idx)}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1)} className="text-center" >
                  No matching records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
        <div className="entries-info">
          Showing {startEntry} to {endEntry} of {filteredData.length} entries
          {search && data.length !== filteredData.length && (
            <> (filtered from {data.length} total entries)</>
          )}
        </div>

        <div className="pagination-controls">
          <button className="page-nav" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} >
            <i className="uil-angle-left"></i>
          </button>
          {renderPagination()}
          <button className="page-nav" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} >
            <i className="uil-angle-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PiSysTable;