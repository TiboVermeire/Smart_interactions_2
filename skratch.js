const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');
const path = require('path');

// Laad de face-api.js-modellen
faceapi.nets.ssdMobilenetv1.loadFromDisk('models');
faceapi.nets.faceRecognitionNet.loadFromDisk('models');

// Functie om afbeeldingen te laden en te labelen
async function loadImages() {
  const labels = [];
  const imagesByLabel = {};

  // Loop door elke persoonsmap in de dataset
  const personsDir = path.join(__dirname, 'dataset');
  const personDirs = fs.readdirSync(personsDir);

  for (const personDir of personDirs) {
    const personPath = path.join(personsDir, personDir);

    if (fs.lstatSync(personPath).isDirectory()) {
      labels.push(personDir);
      imagesByLabel[personDir] = fs
        .readdirSync(personPath)
        .map(file => path.join(personPath, file))
        .map(imagePath => canvas.loadImage(imagePath));
    }
  }

  return { labels, imagesByLabel };
}

// Train het model met de geladen afbeeldingen
async function trainModel() {
  const { labels, imagesByLabel } = await loadImages();
  const labeledFaceDescriptors = await Promise.all(
    labels.map(async label => {
      const descriptors = await Promise.all(imagesByLabel[label].map(async image => {
        const detections = await faceapi.detectSingleFace(image).withFaceDescriptor();
        return detections.descriptor;
      }));
      return new faceapi.LabeledFaceDescriptors(label, descriptors);
    })
  );

  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

  return faceMatcher;
}

// Train het model en bewaar het
(async function() {
  const faceMatcher = await trainModel();
  const modelPath = path.join(__dirname, 'trainedModel.json');
  fs.writeFileSync(modelPath, JSON.stringify(faceMatcher.serialize()));
  console.log('Model trained and saved.');
})();

