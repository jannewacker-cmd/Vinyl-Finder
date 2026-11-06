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
              video: { facingMode: 'environment' },
              audio: false
          });
          video.srcObject = stream;
          statusText.innerText = "Bereit zum Scannen...";
      } catch (err) {
          console.error(err);
          statusText.innerText = "Kamera-Berechtigung erforderlich.";
      }
  }

  // 2. Foto aufnehmen
  captureBtn.addEventListener('click', () => {
      statusText.innerText = "Erfasse Foto...";
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Wir reduzieren die Qualität massiv, damit das Bild klein genug für die mobile Leitung ist
      const dataUrl = canvas.toDataURL('image/jpeg', 0.3); // 30% Qualität
      photoPreview.innerHTML = `<img src="${dataUrl}" style="max-width:100%; border-radius:10px;" />`;

      statusText.innerText = "Bild erstellt. Sende an KI...";

      // Kurze Verzögerung, damit das UI aktualisiert wird
      setTimeout(() => {
          processImage(dataUrl);
      }, 500);
  });

  // 3. Die "Intelligenz"
  async function processImage(dataUrl) {
      try {
          statusText.innerText = "Sende Daten an Google...";

          // Extrahiere das Base64
          const base64Data = dataUrl.split(',')[1];

          // Wir loggen die Datenlänge zur Kontrolle
          console.log("Datenlänge gesendet:", base64Data.length);

          const response = await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Server Fehler (${response.status}): ${errorText}`);
          }

          const result = await response.json();
          const identifiedText = result.candidates[0].content.parts[0].text.trim();

          statusText.innerText = `Gefunden: ${identifiedText}`;
          renderSearchButton(identifiedText);

      } catch (error) {
          console.error("Fehler im Detail:", error);
          statusText.innerText = "Fehler: " + error.message;
      }
  }

  function renderSearchButton(query) {
      // Entferne alte Buttons falls vorhanden
      const oldButtons = document.querySelectorAll('button');
      oldButtons.forEach(btn => btn.remove());

      const button = document.createElement('button');
      button.innerText = "Zu Apple Music Suche";
      button.style.cssText = "margin-top:20px; padding:15px; background-color:#e63946; color:white; border:none; border-radius:10px; font-size:1.1rem;";

      button.onclick = () => {
          const searchUrl = `https://music.apple.com/search?q=${encodeURIComponent(query)}`;
          window.open(searchUrl, '_blank');
      };

      statusText.parentElement.appendChild(button);
  }

  initCamera();
