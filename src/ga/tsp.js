import { useEffect, useRef, useState } from "react";
import { Row, Button, Col } from "react-bootstrap";
import { GithubPicker } from "react-color";
import GA from "./ga";
import { Range } from "./range";

const generateRandomGraph = (n, height, width) => {
  const graphNodes = [];
  for (let i = 0; i < n; i++) {
    const x = Math.round(Math.random() * (width - 100)) + 50;
    const y = Math.round(Math.random() * (height - 100)) + 50;
    graphNodes.push({ id: i, x, y });
  }
  return graphNodes;
};

const plotNodes = (ctx, graph, cityColor) => {
  let l = graph.length;
  for (let i = 0; i < l; i++) {
    ctx.beginPath();
    ctx.arc(graph[i].x, graph[i].y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = cityColor;
    ctx.fill();
    ctx.closePath();
    // ctx.font = "8pt Calibri";
    // ctx.fillStyle = "white";
    // ctx.textAlign = "center";
    // ctx.fillText(i.toString(), graph[i].x - 0.5, graph[i].y + 3);
  }
};

const plotEdges = (ctx, graph, result, edgeColor, cityColor) => {
  ctx?.clearRect(0, 0, window.innerWidth - 300, window.innerHeight);
  // plotEdges(ctx, graphRef.current);

  let l = result ? result.length : 0;
  for (let i = 0; i < l - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(graph[result[i]].x, graph[result[i]].y);
    ctx.lineTo(graph[result[i + 1]].x, graph[result[i + 1]].y);
    ctx.strokeStyle = edgeColor;
    ctx.stroke();
  }

  plotNodes(ctx, graph, cityColor);
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
  const [cityColor, setCityColor] = useState("#9AFF6E");
  const [edgeColor, setEdgeColor] = useState("#DA60FF");
  const [showCityNumber, setShowCityNumber] = useState(false);

  useEffect(() => {
    setGASteps(GA(cities, graphRef.current, generations, initialPopulation));
  }, [generations, initialPopulation]);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      setOver(false);

      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");
      graphRef.current = generateRandomGraph(
        cities,
        window.innerHeight,
        window.innerWidth - 300
      );
      ctx?.clearRect(0, 0, window.innerWidth - 300, window.innerHeight);
      setData(null);
      // plotEdges(ctx, graphRef.current);
      plotNodes(ctx, graphRef.current, cityColor);
      setCtx(ctx);
      setGASteps(GA(cities, graphRef.current, generations, initialPopulation));
    }
  }, [canvasRef, cities, over]);

  useEffect(() => {
    if (status.localeCompare("Paused") === 0 && ctx) {
      plotEdges(
        ctx,
        graphRef.current,
        data?.result?.path,
        edgeColor,
        cityColor
      );
    }
  }, [cityColor, edgeColor]);
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
        plotEdges(
          ctx,
          graphRef.current,
          state.result.path,
          edgeColor,
          cityColor
        );
      }, speed);
      return () => {
        clearInterval(interval);
      };
    }
  }, [
    gaSteps,
    status,
    speed,
    initialPopulation,
    generations,
    cities,
    cityColor,
    edgeColor,
  ]);

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
                margin: "0px 4px 0px 4px",
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
            <Button
              disabled={over}
              variant={
                status.localeCompare("Playing") === 0 ? "dark" : "success"
              }
              style={{
                padding: "2px 8px 2px 8px",
                margin: "0px 4px 0px 4px",
                boxShadow: "none",
                fontSize: 12,
              }}
              onClick={(e) => {
                e.preventDefault();
                setOver(true);
              }}
            >
              Restart
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

        <div
          style={{ width: "100%", height: 1, backgroundColor: "#989898" }}
        ></div>
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
            }}
          >
            {data ? (
              <span
                style={{ fontSize: 12, fontWeight: "500", textAlign: "left" }}
              >{`Generation covered : ${Math.floor(data.gen)}`}</span>
            ) : null}
          </Col>
        </Row>

        <Range
          min={0}
          max={20000}
          step={10}
          title="Generations"
          value={generations}
          onChange={(val) => {
            setGenerations(val);
          }}
        ></Range>

        <Range
          min={0}
          max={100}
          step={1}
          title="Cities"
          value={cities}
          onChange={(val) => {
            setCities(val);
          }}
        ></Range>

        <Range
          min={10}
          max={100}
          step={1}
          title="Initial population"
          value={initialPopulation}
          onChange={(val) => {
            setInitialPopulation(val);
          }}
        ></Range>

        <Range
          min={50}
          max={2000}
          step={10}
          title="Speed"
          value={speed}
          onChange={(val) => {
            setSpeed(val);
          }}
        ></Range>

        <div
          style={{ width: "100%", height: 1, backgroundColor: "#989898" }}
        ></div>
        <Row
          style={{
            padding: 2,
            margin: "4px 0px 4px 0px",
            textAlign: "left",
            fontSize: 12,
            fontWeight: "500",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: cityColor,
              width: 10,
              height: 10,
              margin: "0px 10px 0px 0px",
              borderRadius: 5,
            }}
          ></div>
          <span>City color</span>
        </Row>
        <GithubPicker
          width={"100%"}
          color={cityColor}
          triangle="hide"
          onChangeComplete={(color, event) => {
            // console.log(color);
            setCityColor(color.hex);
          }}
        />

        <Row
          style={{
            padding: 2,
            margin: "2px 0px 4px 0px",
            textAlign: "left",
            fontSize: 12,
            fontWeight: "500",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: edgeColor,
              width: 10,
              height: 10,
              margin: "0px 10px 0px 0px",
              borderRadius: 5,
            }}
          ></div>
          <span>Edge color</span>
        </Row>
        <GithubPicker
          width={"100%"}
          triangle="hide"
          color={edgeColor}
          onChangeComplete={(color, event) => {
            // console.log(color);
            setEdgeColor(color.hex);
          }}
        />
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
