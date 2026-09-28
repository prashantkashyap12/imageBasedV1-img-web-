import {
  Card,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Table,
  Container,
  Row,
  Button,
} from "reactstrap";
// core components
import NormalHeader from "components/Headers/NormalHeader";
import { Modal } from "react-bootstrap";
import { useEffect, useRef, useState, useCallback } from "react";
import Spinner from "react-bootstrap/Spinner";
import Select from "react-select";
import { toast } from "react-toastify";
import { createUser } from "helper/userManagment_helper";
import { fetchAllUsers } from "helper/userManagment_helper";
import { updateUser } from "helper/userManagment_helper";
import { removeUser } from "helper/userManagment_helper";
import Placeholder from "../../components/ui/Placeholder"
import { GiCrossMark } from "react-icons/gi";
import { PhoneInput, usePhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const roles = [
  { roleName: "admin" },
  { roleName: "moderator" },
  { roleName: "operator" },
];

const UserManagment = () => {
  const [modalShow, setModalShow] = useState(false);
  const [createModalShow, setCreateModalShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectecdRole, setSelectedRole] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [spanDisplay, setSpanDisplay] = useState("none");
  const [allUsers, setAllUsers] = useState([]);
  const [id, setId] = useState("");

  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const [isValid, setIsValid] = useState(true);
  const confirmRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setAllUsers(data?.result || []);
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setAllUsers([]);
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectRole = (selectedValue) => {
    setSelectedRole(selectedValue);
  };

  //Current user's role
  const userData = JSON.parse(localStorage.getItem("userData"));
  const loggedInRole = userData?.role;
  const isAdmin = loggedInRole === "admin";
  const [originalEditData, setOriginalEditData] = useState({
  name: "",
  phoneNumber: "",
  role: "",
  password: "",
});


  const { inputValue, country, } = usePhoneInput({ defaultCountry: "in", value: phoneNumber, onChange: ({ phone }) => { setPhoneNumber(phone); }, });


 const handleUpdate = async () => {
  const currentRole =
    typeof selectecdRole === "object"
      ? selectecdRole?.roleName
      : selectecdRole;

  const hasChanges =
    name.trim() !== originalEditData.name.trim() ||
    phoneNumber.trim() !== originalEditData.phoneNumber.trim() ||
    currentRole !== originalEditData.role ||
    password.trim() !== originalEditData.password.trim();

  if (!hasChanges) {
    toast.info("Please make changes before updating.");
    return;
  }

  // Existing validation
  if (!name || !phoneNumber || !selectecdRole || !password) {
    setSpanDisplay("inline");
    return;
  }

  try {
    setBtnLoading(true);

    const payload = {
      empid: id,
      name: name.trim(),
      email: email,
      pwd: password.trim(),
      cont: phoneNumber.trim(),
      role: currentRole,
    };

    const response = await updateUser(payload);

    if (response) {
      toast.success("User updated successfully");
      setModalShow(false);
      await fetchUsers();
    } else {
      toast.error("Update Failed");
    }
  } catch (error) {
    console.error("Update Error:", error);
    toast.error("Something went wrong");
  } finally {
    setBtnLoading(false);
  }
};

  const handleCreate = async () => {
    if (!name || !email || !phoneNumber || !selectecdRole || !password || !ConfirmPassword) {
      setSpanDisplay("inline");
      return;
    }

    if (!phoneNumber) {
      toast.warn("Phone number is required.");
      return;
    }

    const dialCode = country.dialCode;

    // Remove country code from complete phone number
    const phoneWithoutCountryCode = phoneNumber.replace(
      new RegExp(`^\\+${dialCode}`),
      ""
    );

    // Check exactly 10 digits
    const isValidPhone = /^\d{10}$/.test(phoneWithoutCountryCode);

    if (!isValidPhone) {
      toast.warn("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!isValid) {
      toast.warn("Invalid Email");
      return;
    }

    // Password match
    if (password !== ConfirmPassword) {
      toast.error("Password did not match");
      return;
    }

    try {
      setBtnLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        cont: phoneNumber,
        role: selectecdRole?.roleName?.trim(),
        pwd: password.trim(),
      };

      const data = await createUser(payload);

      if(data?.state === true) {
        toast.success("User Created Successfully");
        setCreateModalShow(false);
        await fetchUsers();
      }
      if(data?.state === false){
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteUser = async (d) => {
    const result = window.confirm("Are you sure you want to delete user?");
    if (!result) {
      return;
    }

    try {
      const data = await removeUser(d.empId);
      if (data) {
        toast.success("User Deleted successfully");
        setModalShow(false);
        await fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

 const handleRowClick = (d) => {
  const editData = {
    name: d.empName || "",
    phoneNumber: d.contact || "",
    role: d.role || "",
    password: d.password || "",
  };

  // Set current form values
  setName(editData.name);
  setEmail(d.empEmail || "");
  setPhoneNumber(editData.phoneNumber);
  setSelectedRole({ roleName: editData.role });
  setPassword(editData.password);
  setId(d.empId);

  // Store original values for comparison
  setOriginalEditData(editData);

  // Reset validation state
  setSpanDisplay("none");

  setModalShow(true);
};

  const placeHolderUser = new Array(10).fill(null).map((_, index) => (
    <tr key={index}>
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
      <td>
        <Placeholder width="60%" height="1.5em" />
      </td>
      <td></td>
    </tr>
  ));

  const ALLUSER = allUsers?.map((d, i) => (
    <>
      <tr key={d.empId}>
        <td>{i + 1}</td>
        <td>{d?.empName}</td>
        <td>{d?.empEmail}</td>
        <td>{d?.contact}</td>
        <td>{d?.role}</td>
        {isAdmin && (
          <td className="text-right">
            <UncontrolledDropdown>
              <DropdownToggle
                className="btn-icon-only text-light"
                href="#pablo"
                role="button"
                size="sm"
                color=""
                disabled={!isAdmin}
                onClick={(e) => e.preventDefault()}>
                <i className="fas fa-ellipsis-v" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem href="#pablo" onClick={() => handleRowClick(d)}>
                  Edit
                </DropdownItem>
                <DropdownItem href="#pablo" onClick={(e) => deleteUser(d)}>
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </td>
        )}
      </tr>
    </>
  ));

  return (
    <>
      <NormalHeader />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <div className="d-flex justify-content-between">
                  <h3 className="mt-2">All Users</h3>

                  {isAdmin && (
                    <Button
                      className=""
                      color="primary"
                      type="button"
                      onClick={() => {
                        setName("");
                        setEmail("");
                        setPhoneNumber("");
                        setSelectedRole(null);
                        setPassword("");
                        setConfirmPassword("");
                        setIsValid(true);
                        setBtnLoading(false);
                        setCreateModalShow(true);
                      }}>
                      Create User
                    </Button>
                  )}
                </div>
              </CardHeader>
              <div style={{ height: "70vh", overflow: "auto" }}>
                <Table
                  className="align-items-center table-flush mb-45"
                  responsive >
                  <thead
                    className="thead-light"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}>
                    <tr>
                      <th style={{ width: "60px" }}>S.No</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Role</th>
                      {isAdmin && <th style={{ width: "120px" }}>Action</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {/* Loading */}
                    {loading && placeHolderUser}

                    {/* Data */}
                    {!loading && ALLUSER.length > 0 && ALLUSER}

                    {/* Empty State */}
                    {!loading && ALLUSER.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </div>
        </Row>
      </Container>

      {/* User Edit Model */}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit User
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-3">
          {/* Name */}
          <Row className="mb-3 align-items-center">
            <label className="col-md-3 col-form-label fw-semibold">Name</label>
            <div className="col-md-9">
              <input
                type="text"
                className="form-control"
                placeholder="Enter User Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {!name && (
                <span className="text-danger small d-block mt-1" style={{ display: spanDisplay }}>
                  This field is required
                </span>
              )}
            </div>
          </Row>

          {/* Phone Number */}
          <Row className="mb-3 align-items-center">
            <label className="col-md-3 col-form-label fw-semibold">Phone Number</label>
            <div className="col-md-9">
              <PhoneInput
                defaultCountry="in"
                value={inputValue}
                onChange={(phone) => setPhoneNumber(phone)}
                className="w-100"
                inputClassName="form-control w-100"
                placeholder="Enter Phone Number"
              />
              {!phoneNumber && (
                <span className="text-danger small d-block mt-1" style={{ display: spanDisplay }}>
                  This field is required
                </span>
              )}
            </div>
          </Row>

          {/* Password */}
          <Row className="mb-3 align-items-center">
            <label className="col-md-3 col-form-label fw-semibold">Password</label>
            <div className="col-md-9">
              <input
                type="password"
                className="form-control"
                placeholder="Enter New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!password && (
                <span className="text-danger small d-block mt-1" style={{ display: spanDisplay }}>
                  This field is required
                </span>
              )}
            </div>
          </Row>

          {/* Role */}
          <Row className="mb-3 align-items-center">
            <label className="col-md-3 col-form-label fw-semibold">Role</label>
            <div className="col-md-9">
              <Select
                value={selectecdRole}
                onChange={handleSelectRole}
                options={roles}
                getOptionLabel={(option) => option?.roleName || ""}
                getOptionValue={(option) => option?.roleName?.toString() || ""}
              />
              {!selectecdRole && (
                <span className="text-danger small d-block mt-1" style={{ display: spanDisplay }}>
                  This field is required
                </span>
              )}
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
          </Button>

          <Button
            type="button"
            color="success"
            disabled={btnLoading}
            onClick={handleUpdate}
            className="waves-effect waves-light"
          >
            {btnLoading ? (
              <Spinner animation="border" role="status" size="sm" />
            ) : (
              "Update"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create User Model */}
      <Modal
        show={createModalShow}
        onHide={() => setCreateModalShow(false)}
        size="lg"
        centered      >
        <Modal.Header>
          <Modal.Title>Create User</Modal.Title>

          <button
            onClick={() => setCreateModalShow(false)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "22px",
              cursor: "pointer",
            }}>
            <GiCrossMark />
          </button>
        </Modal.Header>

        <Modal.Body>
          {/* Email */}
          <Row className="mb-3">
            <label className="col-md-2 col-form-label">Email</label>
            <div className="col-md-10">
              <input
                type="email"
                className={`form-control ${!isValid ? "is-invalid" : ""}`}
                placeholder="Enter Email Id"
                ref={emailRef}
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);

                  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  setIsValid(regex.test(value));
                }}
              />
            </div>
          </Row>

          {/* Username */}
          <Row className="mb-3">
            <label className="col-md-2 col-form-label">Username</label>

            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                placeholder="Enter User Name"
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, "");
                  setName(value);
                }} />
            </div>
          </Row>

          {/* Phone */}
          <Row className="mb-3">
            <label className="col-md-2 col-form-label">Phone Number</label>

            <div className="col-md-10">
              <PhoneInput
                defaultCountry="in"
                minlength="10"
                inputClassName="form-control w-100"
                placeholder="Enter 10 digit Phone Number"
                maxLength={10}
                onChange={(phone) => setPhoneNumber(phone)} />
            </div>
          </Row>

          <Row className="mb-3 align-items-center">
            <label htmlFor="roleSelect" className="col-md-2 col-form-label">
              Role
            </label>

            <div className="col-md-10">
              <Select
                inputId="roleSelect"
                onChange={handleSelectRole}
                options={roles}
                getOptionLabel={(role) => role.roleName}
                getOptionValue={(role) => String(role.roleId)}
                placeholder="Select Role"
                isClearable
              />
            </div>
          </Row>

          <Row className="mb-3">
            <label className="col-md-2 col-form-label">Confirm Password</label>

            <div className="col-md-10">
              <input
                type="password"
                className="form-control"
                placeholder="Enter Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </Row>

          {/* Confirm Password */}
          <Row className="mb-3">
            <label className="col-md-2 col-form-label">Confirm Password</label>

            <div className="col-md-10">
              <input
                type="password"
                className="form-control"
                placeholder="Enter Confirm Password"
                ref={confirmRef}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {password && ConfirmPassword && password !== ConfirmPassword && (
                <span style={{ color: "red" }}>
                  Password and Confirm Password must match
                </span>
              )}
            </div>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button color="secondary" onClick={() => setCreateModalShow(false)}>
            Close
          </Button>

          <Button
            color="success"
            disabled={btnLoading}
            onClick={handleCreate}
            className="d-flex align-items-center justify-content-center">
            {btnLoading ? <Spinner size="sm" /> : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserManagment;
