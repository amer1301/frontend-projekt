let map; // Skapa en global variabel för kartan
// Skapa olika ikoner baserat på prioritet
const priorityIcons = {
    1: L.icon({
        iconUrl: './images/priority1.png',
        iconSize: [
            32,
            32
        ],
        iconAnchor: [
            16,
            32
        ],
        popupAnchor: [
            0,
            -32
        ]
    }),
    2: L.icon({
        iconUrl: './images/priority2.png',
        iconSize: [
            32,
            32
        ],
        iconAnchor: [
            16,
            32
        ],
        popupAnchor: [
            0,
            -32
        ]
    }),
    3: L.icon({
        iconUrl: './images/priority3.png',
        iconSize: [
            32,
            32
        ],
        iconAnchor: [
            16,
            32
        ],
        popupAnchor: [
            0,
            -32
        ]
    }),
    4: L.icon({
        iconUrl: './images/priority4.png',
        iconSize: [
            32,
            32
        ],
        iconAnchor: [
            16,
            32
        ],
        popupAnchor: [
            0,
            -32
        ]
    }),
    5: L.icon({
        iconUrl: './images/priority5.png',
        iconSize: [
            32,
            32
        ],
        iconAnchor: [
            16,
            32
        ],
        popupAnchor: [
            0,
            -32
        ]
    })
};
// Funktion för att visa en karta med en förvald plats
function initializeMap() {
    // Förvald plats (Stockholm) när sidan laddas
    const defaultLat = 59.3293; // Latitude för Stockholm
    const defaultLon = 18.0686; // Longitude för Stockholm
    // Skapa kartan och sätt en initial vy
    map = L.map('map').setView([
        defaultLat,
        defaultLon
    ], 13); // Initiala koordinater och zoom
    // Lägg till OpenStreetMap lager
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // Lägg till en markör på förvald plats
    L.marker([
        defaultLat,
        defaultLon
    ]).addTo(map).bindPopup('Stockholm').openPopup();
    // Hämta trafikinfo för förvald plats
    getTrafficInfo(defaultLat, defaultLon, 'Stockholm');
}
// Hämtar koordinater från Nominatim API (OpenStreetMap)
async function getCoordinates(location) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1`);
        const data = await response.json();
        if (data.length > 0) {
            const lat = data[0].lat;
            const lon = data[0].lon;
            updateMap(lat, lon); // Uppdatera kartan med de nya koordinaterna
            getTrafficInfo(lat, lon, location); // Hämta trafikinfo för den nya platsen
        } else alert('Platsen kunde inte hittas!');
    } catch (error) {
        console.error("Fel vid h\xe4mtning av koordinater:", error);
        alert("N\xe5got gick fel n\xe4r platsen skulle s\xf6kas.");
    }
}
// Uppdaterar kartan med en ny plats
function updateMap(lat, lon) {
    if (!map) {
        // Om kartan inte har initialiserats än, skapa den
        map = L.map('map').setView([
            lat,
            lon
        ], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else // Om kartan redan finns, bara uppdatera center och zoom
    map.setView([
        lat,
        lon
    ], 13);
    // Lägg till markör på den nya platsen
    L.marker([
        lat,
        lon
    ]).addTo(map).bindPopup('Platsen: ' + lat + ', ' + lon).openPopup();
}
// Eventlyssnare för att hämta koordinater när användaren söker
document.getElementById('search-btn').addEventListener('click', function() {
    const location = document.getElementById('location-input').value;
    if (location) getCoordinates(location); // Hämtar koordinater för den angivna platsen
    else alert("V\xe4nligen ange en plats!");
});
// Hämtar trafikmeddelanden baserat på plats
async function getTrafficInfo(userLat, userLon, location) {
    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = "";
    const url = `https://api.sr.se/api/v2/traffic/messages?format=json&search=${encodeURIComponent(location)}`;
    const response = await fetch(url);
    const data = await response.json();
    displayTrafficInfo(data); // Visa trafikinformationen i info-diven
    addTrafficMarkers(data, userLat, userLon); // Lägg till markörer för trafikstörningar på kartan
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
// Lägg till markörer för trafikstörningar på kartan
function addTrafficMarkers(data, userLat, userLon) {
    if (data.messages && data.messages.length > 0) data.messages.forEach((message)=>{
        const lat = message.latitude;
        const lon = message.longitude;
        const icon = priorityIcons[message.priority] || priorityIcons[3];
        const distance = getDistance(userLat, userLon, lat, lon);
        if (distance < 50) L.marker([
            lat,
            lon
        ]).addTo(map).bindPopup(`
                        <strong>${message.title}</strong><br>
                        ${message.description || "Ingen ytterligare information."}<br>
                        <em>Allvarlighetsgrad: ${getPriorityLabel(message.priority)}</em>
                    `).openPopup();
    });
}
// Hjälpfunktion för att beräkna avstånd mellan två geografiska punkter (i kilometer)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Jordens radie i kilometer
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Avståndet i kilometer
}
// Hjälpfunktion för att ge en mer läsbar text för prioriteten
function getPriorityLabel(priority) {
    switch(priority){
        case 1:
            return "Mycket allvarlig h\xe4ndelse";
        case 2:
            return "Stor h\xe4ndelse";
        case 3:
            return "St\xf6rning";
        case 4:
            return "Information";
        case 5:
            return "Mindre st\xf6rning";
        default:
            return "Ok\xe4nd prioritet";
    }
}
// Initialisera kartan vid sidladdning
initializeMap();

//# sourceMappingURL=index.9ad3db90.js.map
