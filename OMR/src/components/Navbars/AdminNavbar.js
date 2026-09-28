import { getPackages } from "helper/Pricing_helper";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useScan } from "context/ScanningContext";

import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);

const {userName} = JSON.parse(localStorage.getItem("userData"));
  const {isScanning} = useScan();

  const getCredits = async () => {
    try {
      const response = await getPackages();
      const initialPlan = await response.activePackage;
      setCredits(initialPlan.recognition_credits_total);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  useEffect(() => {
    getCredits();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login", {
      replace: true,
    });
  };

  return (
    <Navbar
      className="navbar-top navbar-light shadow-sm"
      expand="md"
      id="navbar-main"
      style={{
        position: "fixed",
        top: 0,
        left: "250px", 
        right: 0,
        height: "60px",
        zIndex: 1030,
      }}
    >
      <Container fluid className="h-100">
        <Nav className="align-items-center ml-auto" navbar>

          {/* Profile */}
          <UncontrolledDropdown nav>
            <DropdownToggle
              nav
              className="d-flex align-items-center"
              caret={false}
              disabled={isScanning}
              >
              <Media className="align-items-center">
                <Media body className="mr-2 d-none d-lg-block">
                  <span className="mb-0 text-sm font-weight-bold text-white">
                    {userName}
                  </span>
                </Media>

                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                  style={{
                    width: "40px",
                    height: "40px",
                  }}
                >
                  <i className="ni ni-single-02"></i>
                </div>
              </Media>
            </DropdownToggle>

            <DropdownMenu right className="dropdown-menu-arrow">
              <DropdownItem header className="noti-title">
                <h6 className="m-0">Welcome!</h6>
              </DropdownItem>

              <DropdownItem tag={Link} to="/admin/user-profile">
                <i className="ni ni-single-02" />
                <span>My Profile</span>
              </DropdownItem>

              <DropdownItem divider />

              <DropdownItem onClick={handleLogout}>
                <i className="ni ni-user-run" />
                <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
