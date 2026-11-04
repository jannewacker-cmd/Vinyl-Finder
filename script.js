 const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captureBtn = document.getElementById('capture-btn');
  const photoPreview = document.getElementById('photo-preview');
  const statusText = document.getElementById('status-text');

  // 1. Kamera starten
  async function initCamera() {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                  facingMode: 'environment' // Nutzt die Rückseite
              },
              audio: false
          });
          video.srcObject = stream;
      } catch (err) {
          console.error("Fehler beim Zugriff auf die Kamera:", err);
          statusText.innerText = "Kamera-Berechtigung erforderlich.";
      }
  }

  // 2. Foto aufnehmen
  captureBtn.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Zeichne das aktuelle Videoframe auf das Canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Erzeuge ein Bild-Element aus dem Canvas
      const dataUrl = canvas.toDataURL('image/jpeg');

      // Zeige das Foto an
      photoPreview.innerHTML = `<img src="${dataUrl}" />`;

      // Feedback geben
      statusText.innerText = "Bild erfasst! Analyse läuft...";

      // Hier kommt später die KI/Discogs Logik rein
      processImage(dataUrl);
  });

  // Platzhalter für die KI-Analyse
  function processImage(dataUrl) {
      console.log("Bild wird zur Analyse gesendet...");
      // Wir werden hier später die API-Anbindung machen
  }

  // Starte Kamera beim Laden
  initCamera();
