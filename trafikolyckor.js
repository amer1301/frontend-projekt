let map;  // Skapa en global variabel för kartan

import priority1Icon from './images/priority1.png';
import priority2Icon from './images/priority2.png';
import priority3Icon from './images/priority3.png';
import priority4Icon from './images/priority4.png';
import priority5Icon from './images/priority5.png';
import markerIcon from './images/marker.png';

// Skapa olika ikoner baserat på prioritet
const priorityIcons = {
    1: L.icon({
        iconUrl: priority1Icon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    2: L.icon({
        iconUrl: priority2Icon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    3: L.icon({
        iconUrl: priority3Icon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    4: L.icon({
        iconUrl: priority4Icon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    5: L.icon({
        iconUrl: priority5Icon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    })
};

// Funktion för att visa en karta med en förvald plats
function initializeMap() {
    // Förvald plats (Stockholm) när sidan laddas
    const defaultLat = 59.3293;  // Latitude för Stockholm
    const defaultLon = 18.0686;  // Longitude för Stockholm

    // Skapa kartan och sätt en initial vy
    map = L.map('map').setView([defaultLat, defaultLon], 13);  // Initiala koordinater och zoom

    // Lägg till OpenStreetMap lager
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

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
            updateMap(lat, lon);  // Uppdatera kartan med de nya koordinaterna
            getTrafficInfo(lat, lon, location);  // Hämta trafikinfo för den nya platsen
        } else {
            alert('Platsen kunde inte hittas!');
        }
    } catch (error) {
        console.error('Fel vid hämtning av koordinater:', error);
        alert('Något gick fel när platsen skulle sökas.');
    }
}

// Uppdaterar kartan med en ny plats
function updateMap(lat, lon) {
    if (!map) {
        // Om kartan inte har initialiserats än, skapa den
        map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        // Om kartan redan finns, bara uppdatera center och zoom
        map.setView([lat, lon], 13);
    }

    // Lägg till en standard markör med 'marker.png' på den nya platsen
    const userMarker = L.icon({
        iconUrl: markerIcon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    L.marker([lat, lon], { icon: userMarker }).addTo(map)
        .bindPopup('Platsen: ' + lat + ', ' + lon)
        .openPopup();
}

// Eventlyssnare för att hämta koordinater när användaren söker
document.getElementById('search-btn').addEventListener('click', function() {
    const location = document.getElementById('location-input').value;
    if (location) {
        getCoordinates(location);  // Hämtar koordinater för den angivna platsen
    } else {
        alert('Vänligen ange en plats!');
    }
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

    if (data.messages && data.messages.length > 0) {
        data.messages.forEach(message => {
            const messageElement = document.createElement("article");

            const title = document.createElement("h3");
            title.textContent = message.title || "Trafikmeddelande";
            messageElement.appendChild(title);

            const description = document.createElement("p");
            description.textContent = message.description || "Ingen ytterligare information.";
            messageElement.appendChild(description);

            infoDiv.appendChild(messageElement);
        });
    } else {
        const noInfo = document.createElement("p");
        noInfo.textContent = "Ingen trafikinfo tillgänglig för den valda platsen.";
        infoDiv.appendChild(noInfo);
    }
}

// Lägg till markörer för trafikstörningar på kartan
// Lägg till markörer för trafikstörningar på kartan
function addTrafficMarkers(data, userLat, userLon) {
    if (data.messages && data.messages.length > 0) {
        data.messages.forEach(message => {
            const lat = message.latitude;
            const lon = message.longitude;

            const distance = getDistance(userLat, userLon, lat, lon);
            if (distance < 50) { // 50 km avstånd, kan justeras beroende på behov
                // Välj rätt prioriteringsikon för markören
                const icon = priorityIcons[message.priority] || priorityIcons[3];  // Standard ikon om prioritet inte finns
                L.marker([lat, lon], { icon: icon }).addTo(map)
                    .bindPopup(`
                        <strong>${message.title}</strong><br>
                        ${message.description || "Ingen ytterligare information."}<br>
                        <em>Allvarlighetsgrad: ${getPriorityLabel(message.priority)}</em>
                    `)
                    .openPopup();
            }
        });
    }
}


// Hjälpfunktion för att beräkna avstånd mellan två geografiska punkter (i kilometer)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Jordens radie i kilometer
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Avståndet i kilometer
}

// Hjälpfunktion för att ge en mer läsbar text för prioriteten
function getPriorityLabel(priority) {
    switch (priority) {
        case 1: return "Mycket allvarlig händelse";
        case 2: return "Stor händelse";
        case 3: return "Störning";
        case 4: return "Information";
        case 5: return "Mindre störning";
        default: return "Okänd prioritet";
    }
}

// Initialisera kartan vid sidladdning
initializeMap();
