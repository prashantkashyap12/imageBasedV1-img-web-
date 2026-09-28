// reactstrap components
// import { accuracyPercentage } from "helper/Dashboard_helper";
import { totalScanning } from "helper/Dashboard_helper";
import { fetchAllTemplate } from "helper/TemplateHelper";

import { fetchAllUsers } from "helper/userManagment_helper";
import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

const Header = () => {
  const [jobCount, setJobCount] = useState(0);
  const [allUserCount, setAllUserCount] = useState(0);
  const [allScanning, setAllScanning] = useState(0);

 useEffect(() => {
  const fetchDetails = async () => {
    const [templates, users, scanning] = await Promise.allSettled([
      fetchAllTemplate(),
      fetchAllUsers(),
      totalScanning(),
    ]);

    if (templates.status === "fulfilled") {
      setJobCount(templates.value?.body?.length || 0);
    } else {
      console.error("Template API Error:", templates.reason);
    }

    if (users.status === "fulfilled") {
      setAllUserCount(users.value?.result?.length || 0);
    } else {
      console.error("Users API Error:", users.reason);
    }

    if (scanning.status === "fulfilled") {
      setAllScanning(scanning.value?.record || 0);
    } else {
      console.error("Scanning API Error:", scanning.reason);
    }
  };

  fetchDetails();
}, []);


  return (
    <>
      <div className="header bg-gradient-info pb-4 pt-5">
        <div className="d-flex mb-2 align-items-center justify-content-center px-4 py-3 shadow-sm">
          <h1 className="text-white fw-bold display-3">Dashboard</h1>
        </div>
        <Container fluid>
          <div className="header-body mb-3">
            {/* Card stats */}
            <Row>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Total Sheets Scanned
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {allScanning}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          All users
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {allUserCount}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-chart-pie" />
                        </div>
                      </Col>
                    </Row>
    
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Total Templates
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {jobCount}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                          <i className="fas fa-users" />
                        </div>
                      </Col>
                    </Row>
                    {/* <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-warning mr-2">
                        <i className="fas fa-arrow-down" /> 1.10%
                      </span>{" "}
                      <span className="text-nowrap">Since yesterday</span>
                    </p> */}
                  </CardBody>
                </Card>
              </Col>
          
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Header;
