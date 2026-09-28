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
// core components
import NormalHeader from "components/Headers/NormalHeader";
import { Modal, Button, Row, Col, Spinner } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataContext from "../../context/DataContext";
import { fetchAllTemplate } from "helper/TemplateHelper";
import { deleteTemplate } from "helper/TemplateHelper";
import Swal from "sweetalert2";

import { toast } from "react-toastify";
import { getLayoutDataById } from "helper/TemplateHelper";
import Placeholder from "../../components/ui/Placeholder"
import { createTemplate } from "helper/TemplateHelper";

import { fetchAllUsers } from "helper/userManagment_helper";

const Template = () => {
  const [modalShow, setModalShow] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [templateDatail, setTemplateDetail] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateName, setTemplateName] = useState(null);
  const [templateImage, setTemplateImage] = useState(null);
  const navigate = useNavigate();
  const dataCtx = useContext(DataContext);
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const editHandler = async (arr, index) => {
    setLoading(true);

    const templateId = arr.id;
    const res = await getLayoutDataById(templateId);
    if (res?.data?.jsonPath === "") {
      toast.warning("Template Not Created Yet!!");
    }
    console.log(res);
    console.log("text here ");
    // return;
    setLoading(false);
    navigate(`/admin/template/create-template/${arr.id}`);
  };

  const deleteHandler = async (arr, index) => {
    Swal.fire({
      title: "Delete Template?",
      text: "Are you sure you want to delete this template?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result?.isConfirmed) {
        const id = arr?.id;
        const res = await deleteTemplate(id);

        if (res?.state) {
          setToggle((prev) => !prev);

          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Template deleted successfully",
            timer: 1500,
            showConfirmButton: false,
          });
              await loadData();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not delete template",
          });
        }
      }
    });

  };

  const placeHolderJobs = new Array(10).fill(null).map((_, index) => (
    <tr key={index}>
      <td>
        <Placeholder width="20%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td></td>
    </tr>
  ));

  const loadData = async () => {
    try {
      const templatesRes = await fetchAllTemplate();
      const usersRes = await fetchAllUsers();

      const templates = templatesRes?.body || [];
      const users = usersRes?.result || [];

      const updatedTemplates = templates.map((template) => {
        const fileName = template.fileName || "";

        // Try extracting empId
        const match = fileName.match(/##(\d+)$/);
        const empIdFromFile = match ? match[1] : null;

        let roleFromUser = null;

        if (empIdFromFile) {
          const user = users.find(
            (u) => String(u.empId) === String(empIdFromFile),
          );
          roleFromUser = user?.role;
        }

        return {
          ...template,
          role: roleFromUser ?? template.role ?? "N/A",
        };
      });

      dataCtx.addToAllTemplate(updatedTemplates);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };


  useEffect(() => {
    loadData();
  }, [])

  // Get logged-in user
  const userData = JSON.parse(localStorage.getItem("userData"));
  const loggedInEmpId = String(userData?.empid || "");
  const loggedInRole = userData?.role?.toLowerCase();

  // 🔹 Admin sees all, others see only their templates
  const roleBasedTemplates = dataCtx.allTemplates?.filter((template) => {
    if (loggedInRole === "admin") {
      return true;
    }

    const match = template.fileName?.match(/##(\d+)$/);
    const empIdFromFile = match ? match[1] : null;

    return empIdFromFile === loggedInEmpId;
  });

  const filteredTemplates = roleBasedTemplates?.filter((t) => {
    const name = (t.fileName || "").toLowerCase();
    const createdBy = (t.createdBy || "").toLowerCase();
    const search = searchText.toLowerCase();

    return name.includes(search) || createdBy.includes(search);
  });

  const LoadedTemplates = filteredTemplates?.map((d, i) => {
    const cleanName = d.fileName.split("##")[0];

    console.log(filteredTemplates);

    return (
      <tr
        key={i}
        // onClick={() => handleRowClick(d, i)}
        style={{ cursor: "pointer" }}
      >
        <td>{i + 1}</td>
        <td>{cleanName}</td>
        <td>{d.createAt}</td>
        {/* <td>{d.updateAt || "N/A"}</td> */}
        <td>{d.role}</td>

        <td className="text-right">
          <UncontrolledDropdown>
            <DropdownToggle
              className="btn-icon-only text-light"
              href="#pablo"
              role="button"
              size="sm"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-ellipsis-v" />
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem onClick={() => editHandler(d, i)}>
                Edit
              </DropdownItem>

              <DropdownItem
                style={{ color: "red" }}
                onClick={() => deleteHandler(d, i)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    );
  });

  const handleCreate = async () => {
    if (!templateName || !templateImage) {
      toast.error("Please provide both template name and image.");
      return;
    }

    try {
      const { empid } = JSON.parse(localStorage.getItem("userData") || "{}");
      console.log(empid);

      setLoading(true);
      const res = await createTemplate(templateName, templateImage, empid);
      const id = res.data[0].id;
      toast.success("Template created successfully!");
      navigate(`/admin/template/create-template/${id}`);
    } catch (err) {
      console.error("Error creating template:", err);
    }
  };

  return (
    <>
      <NormalHeader />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Table */}
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <h3 className="mt-2">All Templates</h3>

                  <div className="d-flex align-items-center gap-2">
                    {/* Search Bar */}
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{
                        width: "250px",
                        padding: "9px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "15px",
                        marginRight: "20px",
                      }}
                    />

                    <Button
                      color="primary"
                      type="button"
                      onClick={() => setModalShow(true)}
                    >
                      Create Template
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <div style={{ height: "70vh", overflow: "auto" }}>
                {loading && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0, 0, 0, 0.2)", // Slightly opaque background
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 999,
                      pointerEvents: "auto", // Make the overlay not clickable
                    }}
                  >
                    <Spinner />
                  </div>
                )}

                <Table
                  className="align-items-center table-flush mb-5 table-hover"
                >
                  <thead
                    className="thead-light"
                    style={{ position: "sticky", top: 0 }}
                  >
                    <tr>
                      <th>SL no.</th>
                      <th>Template Name</th>
                      <th>Updated Date</th>
                      {/* <th>Updated Date</th> */}
                      <th>Role</th>
                      <th style={{ width: "70px", textAlign: "right" }}></th>
                    </tr>
                  </thead>

                  <tbody>
                    {templateLoading ? placeHolderJobs : LoadedTemplates}
                  </tbody>
                </Table>
              </div>
            </Card>
          </div>
        </Row>
      </Container>

      {/* Template Detail Modal*/}
      {templateDatail.length !== 0 && (
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
          aria-labelledby="modal-custom-navbar"
          centered
        >
          <Modal.Header>
            <Modal.Title id="modal-custom-navbar">
              Template Name : {templateDatail[0].layoutParameters.layoutName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="mb-3">
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Name:
                </label>
              </Col>
              <Col xs={12} md={10}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.layoutName}
                />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Total Row:
                </label>
              </Col>
              <Col xs={12} md={2}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.timingMarks}
                  readOnly
                />
              </Col>
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Total Column:
                </label>
              </Col>
              <Col xs={12} md={2}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.totalColumns}
                  readOnly
                />
              </Col>
              <Col xs={12} md={2}>
                <label
                  htmlFor="example-text-input"
                  style={{ fontSize: ".9rem" }}
                >
                  Bubble Type:
                </label>
              </Col>
              <Col xs={12} md={2}>
                <input
                  type="text"
                  className="form-control"
                  value={templateDatail[0].layoutParameters.bubbleType}
                  readOnly
                />
              </Col>
            </Row>

            {templateDatail.Regions &&
              templateDatail.Regions.map((item, index) => {
                return (
                  <div key={index}>
                    <Row className="mb-3">
                      <Col xs={12} md={2}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          Region Name:
                        </label>
                      </Col>
                      <Col xs={12} md={10}>
                        <input
                          type="text"
                          className="form-control"
                          value={item["Region name"]}
                          readOnly
                        />
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          Start Row:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["Start Row"]}
                          readOnly
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          Start Col:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["Start Col"]}
                          readOnly
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          End Row:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["End Row"]}
                          readOnly
                        />
                      </Col>
                      <Col xs={6} md={3}>
                        <label
                          htmlFor="example-text-input"
                          style={{ fontSize: ".9rem" }}
                        >
                          End Col:
                        </label>
                        <input
                          className="form-control"
                          value={item["Coordinate"]["End Col"]}
                          readOnly
                        />
                      </Col>
                    </Row>
                  </div>
                );
              })}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal
        show={modalShow}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Create Template
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <label htmlFor="example-text-input" className="col-md-2 col-label">
              Template Name
            </label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Template Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
          </Row>
          <Row className="mb-3">
            <label htmlFor="image-upload" className="col-md-2 col-label">
              Upload Image
            </label>
            <div className="col-md-10">
              <input
                type="file"
                className="form-control"
                id="image-upload"
                accept="image/*"
                onChange={(e) => setTemplateImage(e.target.files[0])}
              />
            </div>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            color="primary"
            onClick={() => setModalShow(false)}
            className="waves-effect waves-light"
          >
            Close
          </Button>{" "}
          <Button
            type="button"
            color="success"
            disabled={loading}
            onClick={handleCreate}
            className="waves-effect waves-light"
          >
            {loading && <Spinner animation="border" role="status" />}
            {!loading && "Create"}
          </Button>{" "}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Template;
