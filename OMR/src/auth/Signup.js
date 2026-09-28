import { useState, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
} from "reactstrap";
import Spinner from "react-bootstrap/Spinner";
import Select from "react-select";
import { toast } from "react-toastify";
import { createUser } from "helper/userManagment_helper";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

const roles = [
  { roleName: "admin" },
  { roleName: "moderator" },
  { roleName: "operator" },
];

const ROLE_ROUTES = {
  admin: "/admin/index",
  moderator: "/moderator/index",
  operator: "/operator/index",
};

const Signup = () => {
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: null,
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    const { name, email, phone, role, password, confirmPassword } = form;

    if (!name || !email || !phone || !role || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return false;
    }

    if (!validateEmail(email)) {
      toast.error("Invalid email format.");
      emailRef.current?.focus();
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: null,
      password: "",
      confirmPassword: "",
    });
  };

  console.log(form.phone);

  const signupHandler = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        cont: encodeURIComponent(form.phone),
        role: form.role?.roleName,
        pwd: form.password,
      };

      console.log(payload);

      const res = await createUser(payload);

      if (res?.state !== true) {
        toast.error(res?.message || "Unable to create account");
        return;
      }

      toast.success(res?.message || "Account created successfully");

      resetForm();

      navigate(ROLE_ROUTES[form.role.roleName] || ROLE_ROUTES.admin);
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <div className="text-center text-muted mt-4">
          <img
            alt="..."
            src={require("../assets/img/brand/ios.png")}
            height="30rem"
          />
        </div>

        <CardBody className="px-lg-5 py-lg-3">
          <div className="text-center text-muted mb-4">
            <h1>Create Account</h1>
          </div>

          <Form role="form" onSubmit={signupHandler}>
            {/* Name */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-2">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-single-02" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Full Name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </InputGroup>
            </FormGroup>

            {/* Email */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-2">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-email-83" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input
                  ref={emailRef}
                  placeholder="Email"
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <InputGroup className="input-group-alternative mb-2">
                <PhoneInput
                  defaultCountry="in"
                  value={form.phone}
                  onChange={(phone) => handleChange("phone", phone)}
                  style={{ width: "100%" }}
                  inputStyle={{
                    border: "none",
                    height: "38px",
                    width: "100%",
                  }}
                  countrySelectorStyleProps={{
                    buttonStyle: {
                      border: "none",
                      background: "transparent",
                    },
                  }}
                />
              </InputGroup>
            </FormGroup>

            {/* Role */}
            <FormGroup className="mb-3">
              <Select
                placeholder="Select Role"
                value={form.role}
                options={roles}
                getOptionLabel={(opt) => opt.roleName}
                getOptionValue={(opt) => opt.roleName}
                onChange={(value) => handleChange("role", value)}
              />
            </FormGroup>

            {/* Password */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-2">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>

                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />

                <InputGroupAddon addonType="append">
                  <InputGroupText
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>

            {/* Confirm Password */}
            <FormGroup>
              <InputGroup className="input-group-alternative mb-2">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="ni ni-lock-circle-open" />
                  </InputGroupText>
                </InputGroupAddon>

                <Input
                  placeholder="Confirm Password"
                  type={showConfirmPwd ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />

                <InputGroupAddon addonType="append">
                  <InputGroupText
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  >
                    {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>

            <div className="text-center">
              <Button
                className="my-3"
                color="primary"
                type="submit"
                disabled={isLoading}
                style={{ minWidth: "120px", minHeight: "48px" }}
              >
                {isLoading ? <Spinner animation="border" /> : "Sign Up"}
              </Button>
            </div>

            <div className=" d-flex justify-content-center align-items-center">
              <span>Already have an account?</span>
              <Button
                className="m-0 p-1"
                color="link"
                type="button"
                onClick={() => navigate("/auth/login")}
              >
                {" "}
                Sign In
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Col>
  );
};

export default Signup;
