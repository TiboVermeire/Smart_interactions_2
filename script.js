// script.js

const URL = "https://teachablemachine.withgoogle.com/models/iG8PuTx-H/";

let model, webcam, labelContainer, maxPredictions;
let isScanning = false;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    await webcam.setup();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    toggleScan();
}

function toggleScan() {
  const button = document.getElementById("button");
  if (isScanning) {
      button.textContent = "Start scan";
      webcam.stop();
      clearResults();
      location.reload(); // Reload the page
  } else {
      button.textContent = "Stop scan";
      webcam.play();
  }
  isScanning = !isScanning;
}

function clearResults() {
    for (let i = 0; i < maxPredictions; i++) {
        const labelElement = labelContainer.childNodes[i];
        labelElement.innerHTML = "";
    }
}

async function loop() {
    webcam.update();
    if (isScanning) {
        await predict();
    }
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className;
        const probability = prediction[i].probability;

        const labelElement = labelContainer.childNodes[i];
        labelElement.innerHTML = classPrediction + ": " + probability.toFixed(2);

        if (probability > 0.85) {
            labelElement.style.color = "#00FF00"; // Fluorescent green color
        } else {
            labelElement.style.color = "black"; // Reset to default color
        }
    }
}
