import { useEffect, useRef, useState } from "react";
import { Row, Button, Col } from "react-bootstrap";
import { RangeStepInput } from "react-range-step-input";
import GA from "./ga";

const generateRandomGraph = (n, height, width) => {
  const graphNodes = [];
  for (let i = 0; i < n; i++) {
    const x = Math.round(Math.random() * (width - 100)) + 50;
    const y = Math.round(Math.random() * (height - 100)) + 50;
    graphNodes.push({ id: i, x, y });
  }
  return graphNodes;
};

const plotNodes = (ctx, graph) => {
  let l = graph.length;
  for (let i = 0; i < l; i++) {
    ctx.beginPath();
    ctx.arc(graph[i].x, graph[i].y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
    ctx.font = "8pt Calibri";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(i.toString(), graph[i].x - 0.5, graph[i].y + 3);
  }
};

const plotEdges = (ctx, graph, result) => {
  ctx?.clearRect(0, 0, window.innerWidth - 300, window.innerHeight);
  // plotEdges(ctx, graphRef.current);

  let l = result.length;
  for (let i = 0; i < l - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(graph[result[i]].x, graph[result[i]].y);
    ctx.lineTo(graph[result[i + 1]].x, graph[result[i + 1]].y);
    ctx.strokeStyle = "#40FF00";
    ctx.stroke();
  }

  plotNodes(ctx, graph);
};

const TSP = (props) => {
  const [ctx, setCtx] = useState(null);
  const canvasRef = useRef(null);
  const graphRef = useRef(null);
  const [gaSteps, setGASteps] = useState(null);
  const [status, setStatus] = useState("Paused");
  const [speed, setSpeed] = useState(200);
  const [generations, setGenerations] = useState(20);
  const [initialPopulation, setInitialPopulation] = useState(10);
  const [cities, setCities] = useState(10);
  const [data, setData] = useState(null);
  const [over, setOver] = useState(true);

  useEffect(() => {
    setGASteps(GA(cities, graphRef.current, generations, initialPopulation));
  }, [generations, initialPopulation]);

  useEffect(() => {
    if (canvasRef && canvasRef.current && over) {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      graphRef.current = generateRandomGraph(
        cities,
        window.innerHeight,
        window.innerWidth - 300
      );
      ctx?.clearRect(0, 0, window.innerWidth - 300, window.innerHeight);
      // plotEdges(ctx, graphRef.current);
      plotNodes(ctx, graphRef.current);
      setCtx(ctx);
      setGASteps(GA(cities, graphRef.current, generations, initialPopulation));
    }
  }, [canvasRef, cities, over]);

  useEffect(() => {
    if (gaSteps != null && status.localeCompare("Playing") === 0) {
      const interval = setInterval(() => {
        const next = gaSteps.next();
        if (next.done) {
          setStatus("Paused");
          setGASteps(
            GA(cities, graphRef.current, generations, initialPopulation)
          );
          return;
        }
        const state = next.value;
        setData(state);
        plotEdges(ctx, graphRef.current, state.result.path);
      }, speed);
      return () => {
        clearInterval(interval);
      };
    }
  }, [gaSteps, status, speed, initialPopulation, generations, cities]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 300, height: window.innerHeight, padding: 4 }}>
        <Row style={{ padding: "2px 0px 2px 0px", margin: 0 }}>
          <Col
            style={{
              padding: 2,
              margin: 0,
              justifyContent: "flex-start",
              display: "flex",
            }}
          >
            <Button
              variant={
                status.localeCompare("Playing") === 0 ? "dark" : "success"
              }
              style={{
                padding: "2px 8px 2px 8px",
                boxShadow: "none",
                fontSize: 12,
              }}
              onClick={(e) => {
                e.preventDefault();
                status.localeCompare("Playing") === 0
                  ? setStatus("Paused")
                  : setStatus("Playing");
              }}
            >
              {status.localeCompare("Playing") === 0 ? "Pause" : "Play"}
            </Button>
          </Col>

          <Col style={{ padding: 2, margin: 0 }}>
            {data ? (
              <span
                style={{ fontSize: 12, fontWeight: "500", textAlign: "right" }}
              >{`Best distance : ${Math.floor(data.result.fitness)}`}</span>
            ) : null}
          </Col>
        </Row>
        <Row
          style={{
            padding: 2,
            margin: "2px 0px 2px 0px",
            border: "1px solid #676767",
            borderRadius: 4,
          }}
        >
          <Col style={{ padding: 2, margin: 0 }}>
            <RangeStepInput
              min={100}
              max={2000}
              value={speed}
              step={100}
              onChange={(e) => {
                e.preventDefault();
                setSpeed(e.target.value);
              }}
              style={{ margin: 0, padding: 0 }}
            />
          </Col>
          <Col
            style={{ padding: 2, margin: 0, fontSize: 12, fontWeight: "600" }}
          >
            <span>{`Speed : ${speed}`}</span>
          </Col>
        </Row>

        <Row
          style={{
            padding: 2,
            margin: "2px 0px 2px 0px",
            border: "1px solid #676767",
            borderRadius: 4,
          }}
        >
          <Col style={{ padding: 2, margin: 0 }}>
            <RangeStepInput
              min={5}
              max={100}
              value={initialPopulation}
              step={1}
              onChange={(e) => {
                e.preventDefault();
                setInitialPopulation(e.target.value);
              }}
              style={{ margin: 0, padding: 0 }}
            />
          </Col>
          <Col
            style={{ padding: 2, margin: 0, fontSize: 12, fontWeight: "600" }}
          >
            <span>{`Initial population : ${initialPopulation}`}</span>
          </Col>
        </Row>

        <Row
          style={{
            padding: 2,
            margin: "2px 0px 2px 0px",
            border: "1px solid #676767",
            borderRadius: 4,
          }}
        >
          <Col style={{ padding: 2, margin: 0 }}>
            <RangeStepInput
              min={1}
              max={200}
              value={generations}
              step={1}
              onChange={(e) => {
                e.preventDefault();
                setGenerations(e.target.value);
              }}
              style={{ margin: 0, padding: 0 }}
            />
          </Col>
          <Col
            style={{ padding: 2, margin: 0, fontSize: 12, fontWeight: "600" }}
          >
            <span>{`Generations : ${generations}`}</span>
          </Col>
        </Row>
        <Row
          style={{
            padding: 2,
            margin: "2px 0px 2px 0px",
            border: "1px solid #676767",
            borderRadius: 4,
          }}
        >
          <Col style={{ padding: 2, margin: 0 }}>
            <RangeStepInput
              min={1}
              max={40}
              value={cities}
              step={1}
              onChange={(e) => {
                e.preventDefault();
                setCities(e.target.value);
              }}
              style={{ margin: 0, padding: 0 }}
            />
          </Col>
          <Col
            style={{ padding: 2, margin: 0, fontSize: 12, fontWeight: "600" }}
          >
            <span>{`Cities : ${cities}`}</span>
          </Col>
        </Row>
      </div>
      <div
        style={{ width: window.innerWidth - 300, height: window.innerHeight }}
      >
        <canvas
          id="canvas"
          ref={canvasRef}
          width={window.innerWidth - 300}
          height={window.innerHeight}
          style={{ backgroundColor: "#222222" }}
        ></canvas>
      </div>
    </div>
  );
};

export default TSP;
