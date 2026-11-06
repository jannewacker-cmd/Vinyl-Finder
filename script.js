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
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Etwas kleinere Datei
      photoPreview.innerHTML = `<img src="${dataUrl}" style="max-width:100%; border-radius:10px;" />`;

      statusText.innerText = "KI analysiert das Cover...";
      processImage(dataUrl);
  });

  // 3. Die "Intelligenz"
  async function processImage(dataUrl) {
      try {
          const base64Data = dataUrl.split(',')[1];

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
              throw new Error(`Server antwortete mit Fehler: ${response.status}`);
          }

          const result = await response.json();
          const identifiedText = result.candidates[0].content.parts[0].text.trim();

          statusText.innerText = `Gefunden: ${identifiedText}`;

          // Statt automatisch zu öffnen, erstellen wir einen Button
          renderSearchButton(identifiedText);

      } catch (error) {
          console.error("Fehler:", error);
          statusText.innerText = "Fehler: " + error.message;
      }
  }

  // Funktion zum Erstellen des Buttons
  function renderSearchButton(query) {
      const button = document.createElement('button');
      button.innerText = "Zu Apple Music Suche";
      button.style.marginTop = "20px";
      button.style.padding = "15px";
      button.style.backgroundColor = "#e63946";
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "10px";
      button.style.fontSize = "1.1rem";

      button.onclick = () => {
          const searchUrl = `https://music.apple.com/search?q=${encodeURIComponent(query)}`;
          window.open(searchUrl, '_blank');
      };

      // Entferne das alte Status-Text-Element und füge den Button ein
      statusText.parentElement.appendChild(button);
      // Wir fügen den Button hinzu, aber halten den Text auch
  }

  initCamera();
