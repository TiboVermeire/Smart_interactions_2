// Wacht tot de pagina is geladen
document.addEventListener('DOMContentLoaded', () => {
  startWebcam();
});

// Functie om de webcam te starten
async function startWebcam() {
  try {
      // Vraag toestemming voor webcamtoegang
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Koppel de videostream aan het video-element op de pagina
      const videoElement = document.getElementById('webcam');
      videoElement.srcObject = stream;
  } catch (error) {
      console.error('Error accessing webcam:', error);
  }
}
