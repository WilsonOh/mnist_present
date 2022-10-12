import React, { useLayoutEffect, useState } from "react";
import Result from "./components/ResultComponent";
import Header from "./components/Header";
import example_digit from "./example-digit.png";

const RESULTANT_SIZE = 28;

function resizeImage(image, height, width) {
  const h_diff = Math.floor(height / RESULTANT_SIZE);
  const w_diff = Math.floor(width / RESULTANT_SIZE);
  let result = [];
  for (let i = 0; i < RESULTANT_SIZE; i += 1) {
    result.push([]);
    let row = result[i];
    let row_start = 4 * i * h_diff * width;
    for (let j = 0; j < RESULTANT_SIZE; j += 1) {
      const index = row_start + j * w_diff * 4 + 3;
      if (image[index]) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
  }

  return result;
}
function getResult(result_tensor) {
  let largest_i = 0;
  let largest_val = 0;
  for (let i = 0; i < 10; i += 1) {
    if (result_tensor[i] > largest_val) {
      largest_val = result_tensor[i];
      largest_i = i;
    }
  }
  return largest_i;
}

function getRealCoords(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  let { clientX, clientY } = event;
  clientX = clientX - rect.left;
  clientY = clientY - rect.top;
  return { clientX, clientY };
}

const App = () => {
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState(-1);
  const [confidence, setConfidence] = useState(0);
  const [ultraInstinctMode, setUlIn] = useState(true);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");

    const context = canvas.getContext("2d");
    context.lineWidth = canvas.height / 8;
    context.lineCap = "round";
    context.filter = "grayscale(1)";

    setCanvas(canvas);
    setContext(context);
  }, []);

  async function inference(image) {
    const resp = await fetch("/submit", {
      method: "POST",
      body: JSON.stringify({
        image: image,
        version: ultraInstinctMode,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const result = (await resp.json())["predictions"][0];
    const value = getResult(result);
    const confidence = result[value];
    setConfidence(confidence);
    setResult(value);
    window.scrollBy(0, 500);
  }

  function initiatePath(x, y, context) {
    context.beginPath();
    context.moveTo(x, y);
  }

  function step(x, y, context) {
    context.lineTo(x, y);
    context.stroke();
    initiatePath(x, y, context);
  }

  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  function submit() {
    let image = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let result = resizeImage(image, canvas.height, canvas.width);
    inference(result);
    clearCanvas(canvas, context);
  }

  const handleMouseDown = (event) => {
    setDrawing(true);
    let { clientX, clientY } = getRealCoords(event, canvas);
    initiatePath(clientX, clientY, context);
  };

  const handleMouseMove = (event) => {
    if (!drawing) return;
    const { clientX, clientY } = getRealCoords(event, canvas);
    step(clientX, clientY, context);
  };

  const handleMouseUp = () => {
    setDrawing(false);
    context.stroke();
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const { clientX, clientY } = getRealCoords(touch, canvas);
    context.moveTo(clientX, clientY);
    step(clientX, clientY, context);
  };

  const handleUlIn = () => {
    setUlIn(!ultraInstinctMode);
    document.body.classList.toggle("uITheme");
    window.scrollTo(0, 0);
  };

  const handleDarkTheme = () => {
    document.body.classList.toggle("dark-theme");
  };

  return (
    <div className={ultraInstinctMode ? "ulin" : "normal"}>
      <Header className="header" mode={ultraInstinctMode} />
      <div>
        <div className="flex-container">
          <p className="example-image-text">
            Centre your drawing and maximise the space used for the best result.
            <br></br>
            Example: "0”:
          </p>
          <img
            src={example_digit}
            alt="example-digit"
            style={{
              border: "2px solid black",
              width: "112px",
              height: "112px",
            }}
          />
        </div>
        <canvas
          id="canvas"
          width={Math.min(
            Math.floor(0.6 * window.innerHeight),
            Math.floor(0.6 * window.innerWidth)
          )}
          height={Math.min(
            Math.floor(0.6 * window.innerHeight),
            Math.floor(0.6 * window.innerWidth)
          )}
          style={{
            border: "2px solid #000",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          Canvas
        </canvas>
      </div>
      <div>
        <button className="ulin-button" onClick={handleUlIn}>
          {ultraInstinctMode ? "Normal Mode" : "Ultra Instinct Mode"}
        </button>
      </div>
      <button onClick={submit}>Submit</button>
      <button onClick={clearCanvas}>Clear</button>
      <button onClick={handleDarkTheme}>Toggle Dark</button>
      <Result confidence={confidence} result={result}></Result>
      <div className="footer">
        Created by MA1508E Tutorial T10 Group A 21/22 Semester 2
      </div>
    </div>
  );
};

export default App;
