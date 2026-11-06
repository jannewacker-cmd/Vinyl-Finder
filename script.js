const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captureBtn = document.getElementById('capture-btn');
  const photoPreview = document.getElementById('photo-preview');
  const statusText = document.getElementById('status-text');

  // --- KONFIGURATION ---
  const API_KEY = 'AQ.Ab8RN6Ky7oz_DsGlSk9TBleo9N0tFmaYjmR8YnBNdngtygJx_g';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  // 1. Kamera starten
  async function initCamera() {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                  facingMode: 'environment'
              },
              audio: false
          });
          video.srcObject = stream;
          statusText.innerText = "Bereit zum Scannen...";
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

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Wir brauchen das Bild im Base64 Format für die KI
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      photoPreview.innerHTML = `<img src="${dataUrl}" />`;

      statusText.innerText = "KI analysiert das Cover...";

      // Sende das Bild zur Analyse
      processImage(dataUrl);
  });

  // 3. Die "Intelligenz" - Senden an Gemini
  async function processImage(dataUrl) {
      try {
          // Wir müssen das "data:image/jpeg;base64," Präfix entfernen
          const base64Data = dataUrl.split(',')[1];

          const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  contents: [{
                      parts: [{
                          text: "Identify the album and artist from this vinyl cover. Provide only the title and artist name as a search query (e.g. 'Album Name - Artist'). Do not provide any other explanation."
                      }, {
                          inlineData: {
                              mimeType: "image/jpeg",
                              data: base64Data
                          }
                      }]
                  }]
              })
          });

          const result = await response.json();
          const identifiedText = result.candidates[0].content.parts[0].text.trim();

          console.log("Ergebnis:", identifiedText);
          statusText.innerText = `Gefunden: ${identifiedText}`;

          // Öffne Apple Music Suche
          // Wir nutzen die Apple Music Suche über eine URL
          const searchUrl = `https://music.apple.com/search?q=${encodeURIComponent(identifiedText)}`;
          window.open(searchUrl, '_blank');

      } catch (error) {
          console.error("Fehler bei der Analyse:", error);
          statusText.innerText = "Fehler bei der Erkennung. Versuch es nochmal.";
      }
  }

  // Starte Kamera
  initCamera();
