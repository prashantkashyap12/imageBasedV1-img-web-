import { useState, useEffect, useCallback } from "react";
import { updateUser, fetchAllUsers } from "helper/userManagment_helper";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const [data, setData] = useState({
    empid: "",
    name: "",
    email: "",
    pwd: "",
    cont: "",
    role: "",
  });

  const [originalData, setOriginalData] = useState({
    empid: "",
    name: "",
    email: "",
    cont: "",
    role: "",
  });

  // Fetch all users on component mount
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAllUsers();
      setAllUsers(res?.result || res || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (allUsers.length === 0) return;

    const storedUserData = localStorage.getItem("userData");
    const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

    const targetEmpId = parsedUserData?.empid || parsedUserData?.empid;

    if (targetEmpId) {
      const matchedUser = allUsers.find(
        (user) =>
          String(user.empid || user.empId || user.id) === String(targetEmpId)
      );

      if (matchedUser) {
        const profileData = {
          empid: matchedUser.empid || matchedUser.empId || targetEmpId,
          name: matchedUser.empName || matchedUser.userName || "",
          email: matchedUser.empEmail || "",
          pwd: "",
          cont:
            matchedUser.cont ||
            matchedUser.contact ||
            matchedUser.phoneNumber ||
            "",
          role: matchedUser.role || matchedUser.roleName || "",
        };

        setData(profileData);

        // Store original values for change detection
        setOriginalData({
          empid: profileData.empid,
          name: profileData.name,
          email: profileData.email,
          cont: profileData.cont,
          role: profileData.role,
        });
      }
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setData((prev) => ({
            ...prev,
            name: decoded.unique_name || prev.name,
            email: decoded.email || prev.email,
            cont: decoded.Contact || prev.cont,
          }));
        } catch (err) {
          console.error("Invalid token format");
        }
      }
    }
  }, [allUsers]);

  // Handle input changes
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Update Profile Submit Handler
  const handleUpdate = async (e) => {
    e.preventDefault();

    const hasChanges =
      data.name.trim() !== originalData.name.trim() ||
      data.cont.trim() !== originalData.cont.trim() ||
      data.pwd.trim() !== "";

    if (!hasChanges) {
      toast.info("Please make changes before updating.", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    try {
      await updateUser(data);

      toast.success("Profile updated successfully!", {
        position: "top-right",
      });

      // Clear password after successful update
      setData((prev) => ({
        ...prev,
        pwd: "",
      }));

      // Update original values to current values
      setOriginalData({
        empid: data.empid,
        name: data.name,
        email: data.email,
        cont: data.cont,
        role: data.role,
      });

      await fetchUsers();
    } catch (err) {
      toast.error("Failed to update profile!", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center min-vh-100"
    >
      <ToastContainer />

      <Row className="w-100 justify-content-center">
        <Col lg="6" md="8">
          <Card className="shadow">
            <CardBody>
              <h3 className="text-center mb-4">Update Profile</h3>

              <Form onSubmit={handleUpdate}>
                <Input type="hidden" name="empid" value={data.empid} />

                {/* Name */}
                <FormGroup>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                {/* Email */}
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    disabled
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>

                {/* Password */}
                <FormGroup>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="pwd"
                    value={data.pwd}
                    onChange={handleChange}
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                </FormGroup>

                {/* Contact Number */}
                <FormGroup>
                  <Label>Contact Number</Label>
                  <PhoneInput
                    inputClassName="w-100"
                    defaultCountry="in"
                    value={data.cont}
                    onChange={(phone) =>
                      setData((prev) => ({
                        ...prev,
                        cont: phone,
                      }))
                    }
                  />
                </FormGroup>

                {/* Role */}
                <FormGroup>
                  <Label>Role</Label>
                  <Input
                    type="select"
                    disabled
                    name="role"
                    value={data.role}
                    onChange={handleChange}
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="operator">Operator</option>
                  </Input>
                </FormGroup>

                <Button color="primary" block disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;