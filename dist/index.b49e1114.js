let map; // Skapa en global variabel för kartan
// Hämtar koordinater från Nominatim API (OpenStreetMap)
async function getCoordinates(location) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1`);
        const data = await response.json();
        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            updateMap(lat, lon); // Uppdatera kartan med de nya koordinaterna
            getTrafficInfo(location); // Hämta trafikinfo för den nya platsen
        } else alert('Platsen kunde inte hittas!');
    } catch (error) {
        console.error("Fel vid h\xe4mtning av koordinater:", error);
        alert("N\xe5got gick fel n\xe4r platsen skulle s\xf6kas.");
    }
}
// Uppdaterar kartan med en ny plats
function updateMap(lat, lon) {
    const map = L.map('map').setView([
        lat,
        lon
    ], 13); // Skapar en karta med den valda platsen
    // Lägg till OpenStreetMap lager
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // Lägg till markör på den valda platsen
    L.marker([
        lat,
        lon
    ]).addTo(map).bindPopup("Du s\xf6kte efter denna plats").openPopup();
}
// Eventlyssnare för att hämta koordinater när användaren söker
document.getElementById('search-btn').addEventListener('click', function() {
    const location = document.getElementById('location-input').value;
    if (location) getCoordinates(location); // Hämtar koordinater för den angivna platsen
    else alert("V\xe4nligen ange en plats!");
});
// Hämtar trafikmeddelanden baserat på plats
async function getTrafficInfo(location) {
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = "";
    const url = `https://api.sr.se/api/v2/traffic/messages?format=json&search=${encodeURIComponent(location)}`;
    const response = await fetch(url);
    const data = await response.json();
    displayTrafficInfo(data); // Visa trafikinformationen i info-diven
}
// Visa trafikmeddelanden på sidan
function displayTrafficInfo(data) {
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = "";
    if (data.messages && data.messages.length > 0) data.messages.forEach((message)=>{
        const messageElement = document.createElement("article");
        const title = document.createElement("h3");
        title.textContent = message.title || "Trafikmeddelande";
        messageElement.appendChild(title);
        const description = document.createElement("p");
        description.textContent = message.description || "Ingen ytterligare information.";
        messageElement.appendChild(description);
        infoDiv.appendChild(messageElement);
    });
    else {
        const noInfo = document.createElement("p");
        noInfo.textContent = "Ingen trafikinfo tillg\xe4nglig f\xf6r den valda platsen.";
        infoDiv.appendChild(noInfo);
    }
}

//# sourceMappingURL=index.b49e1114.js.map
