import { Row, Button, Col } from "react-bootstrap";
export const Range = (props) => {
  return (
    <Row
      style={{
        padding: 2,
        margin: "2px 0px 2px 0px",
      }}
    >
      <Col
        style={{
          padding: 2,
          margin: 0,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <input
          type="range"
          min={props.min}
          max={props.max}
          value={props.value}
          step={props.step}
          onChange={(e) => {
            e.preventDefault();
            props.onChange(e.target.value);
          }}
          style={{
            margin: 0,
            padding: 0,
            height: 4,
          }}
        />
      </Col>
      <Col
        style={{
          padding: 2,
          margin: 0,
          fontSize: 12,
          fontWeight: "600",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <span>{`${props.title} : ${props.value}`}</span>
      </Col>
    </Row>
  );
};
