// reactstrap components
import { Container} from "reactstrap";

const SmallHeader = (props) => {
  return (
    <>
      <div className="header bg-gradient-info pb-4 pt-6 pt-md-4">
        <Container fluid>
          <div className="header-body">{/* Card stats */}</div>
        </Container>
      </div>
    </>
  );
};

export default SmallHeader;
