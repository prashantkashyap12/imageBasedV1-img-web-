import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Table,
  Container,
} from "reactstrap";
import { Row } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import NormalHeader from "components/Headers/NormalHeader";
import { getDBRecords, deleteDBRecords } from "helper/ResultGenerationHelper";
import { fetchAllUsers } from "helper/userManagment_helper";
import { fetchAllTemplate } from "helper/TemplateHelper";

export default function ScannedList() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTableData, setSelectedTableData] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allTemplates, setAllTemplates] = useState([]);
  const [scaned, setScaned] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData.role;
  const empId = userData.empid;

  const extractNumericId = (val) => {
    if (!val) return "-";
    const str = String(val);
    const parts = str.split(/[_$]/).filter(Boolean);
    const numericPart = parts.find((p) => !isNaN(p)) || parts.pop();
    return numericPart || str;
  };

  // Fetch all templates
  const fetchAllTemplates = async () => {
    try {
      const result = await fetchAllTemplate();
      const templates = result?.body || [];
      setAllTemplates(templates);
      return templates;
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setAllTemplates([]);
      return [];
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const result = await fetchAllUsers();
      const usersData = result?.result || [];
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      return [];
    }
  };

  // Fetch records
  const fetchRecords = async (
    fileName = "",
    templates = allTemplates,
    usersData = users,
    empID = empId
  ) => {
    try {
      setLoading(true);
      const res = await getDBRecords(fileName);
      const result = res?.queryResult || [];

      if (!result.length) {
        setScaned([]);
        return [];
      }

      // Template Map
      const templateMap = {};
      templates.forEach((temp) => {
        const key = extractNumericId(temp.id || temp.templateId);
        templateMap[key] = temp;
      });

      // User Map Lookup
      const userMap = {};
      usersData.forEach((user) => {
        const key = extractNumericId(user.empId || user.id || user.userId);
        userMap[key] = user;
      });

      // Process records
      const finalData = result.map((item) => {
        const cleanUserId = extractNumericId(item.userId);
        const cleanTemplateId = extractNumericId(item.templateId);

        const template = templateMap[cleanTemplateId] || {};
        const user = userMap[cleanUserId] || {};

        // Use split to extract clean template name (e.g. from "templateBoss##1001" or "Temp_26447")
        const rawTemplateName = template.name || template.templateName || template.fileName || "";
        const cleanTemplateName = rawTemplateName.includes("##")
          ? rawTemplateName.split("##")[0]
          : rawTemplateName.split("_").pop() || rawTemplateName || "-";

        return {
          fileName: item.fileName,
          folderName: item.folderName || "-",
          templateId: cleanTemplateId,
          templateName: cleanTemplateName,
          dateTime: item.dateTime || "-",
          userId: cleanUserId,
          username: user.empName || user.name || "-",
          useremail: user.empEmail || user.email || "-",
          userrole: user.role || "-",
        };
      });

      // Role-based filtering
      const roleBaseData =
        role === "admin" ? finalData : finalData.filter(({ userId }) => String(userId) === String(empID))
          .map(({ username, useremail, userId, userrole, ...rest }) => rest);

      setScaned(roleBaseData);
      return finalData;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      const templates = await fetchAllTemplates();
      const usersData = await fetchUsers();
      await fetchRecords("", templates, usersData, empId);
    };

    loadData();
  }, []);

  // Open Modal using fileName
  const handleOpen = async (row) => {
    const targetFile = row?.fileName;
    const result = await getDBRecords(targetFile, allTemplates);
    const subData = result?.queryResult;

    setSelectedTableData(subData);
    setIsOpen(true);
  };

  // Delete Record using fileName
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, Keep it",
    });

    if (!result.isConfirmed) return;

    try {
      const targetFile = row?.fileName;
      await deleteDBRecords(targetFile);
      await fetchRecords();
      Swal.fire("Deleted!", "Record deleted successfully.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", "Failed to delete record.", "error");
    }
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Filtered Data
  const filteredRecord = scaned.filter((row) =>
    Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  );

  // CSV Download
  const downloadCsv = () => {
    try {
      if (!selectedTableData?.length) {
        toast.error("No data available to download");
        return;
      }

      const header = Object.keys(selectedTableData[0]);
      const rows = selectedTableData.map((row) =>
        header.map((field) => `"${row[field] ?? ""}"`).join(",")
      );

      const csvContent = [header.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Table_Data_Csv.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error("Something went wrong while downloading CSV");
    }
  };

  return (
    <div>
      <NormalHeader />

      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              {/* Header */}
              <CardHeader className="border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">All Records</h3>

                  {/* Search */}
                  <div style={{ width: "250px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>

              {/* Loading */}
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : filteredRecord.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No Records Found
                </div>
              ) : (
                <div style={{ height: "70vh", overflow: "auto" }}>
                  <Table className="align-items-center table-flush">
                    <thead
                      className="thead-light"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      <tr>
                        <th>S.No</th>

                        {Object.keys(filteredRecord[0]).filter((key) => key !== "fileName").map((key) => (
                          <th key={key}>{key}</th>
                        ))}

                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {filteredRecord.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>

                          {Object.entries(row)
                            .filter(([key]) => key !== "fileName")
                            .map(([key, value]) => (
                              <td key={key}>{String(value ?? "-")}</td>
                            ))}

                          {/* Actions */}
                          <td className="text-end">
                            <UncontrolledDropdown>
                              <DropdownToggle
                                className="btn btn-sm btn-icon-only text-light"
                                role="button"
                                onClick={(e) => e.preventDefault()}
                              >
                                <i className="fas fa-ellipsis-v" />
                              </DropdownToggle>

                              <DropdownMenu right>
                                <DropdownItem onClick={() => handleOpen(row)}>
                                  Open
                                </DropdownItem>

                                <DropdownItem
                                  className="text-danger"
                                  onClick={() => handleDelete(row)}
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </Row>
      </Container>

      {/* Modal */}
      {isOpen && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h4 className="mb-0">Data Table</h4>
                </div>

                <div className="modal-body pt-3">
                  {selectedTableData?.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No Data Found
                    </div>
                  ) : (
                    <div
                      style={{ maxHeight: "60vh", overflow: "auto" }}
                      className="border rounded"
                    >
                      <Table className="align-items-center table-flush mb-0">
                        <thead className="thead-light">
                          <tr>
                            {Object.keys(selectedTableData[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {selectedTableData.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i}>{String(value ?? "-")}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 pt-2">
                  <button className="btn btn-success" onClick={downloadCsv}>
                    Download CSV
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}