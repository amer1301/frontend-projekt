
let latitude, longitude;


/**
 * Hämtar koordinater för en given plats via Nominatim API (OpenStreetMap).
 * 
 * @param {string} location - Namnet på platsen som ska sökas efter.
 * @returns {Promise<void>} - En promise som representerar slutförandet av operationen.
 */
async function getCoordinates(location) { 
    try { 
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1`); 
        const data = await response.json(); 

        // Logga koordinater om de hittades 
        if (data.length > 0) { 
            latitude = parseFloat(data[0].lat); 
            longitude = parseFloat(data[0].lon); 
            console.log('Hämtade koordinater:', latitude, longitude); 

            // När koordinater är hämtade, hämta väderdata 
            await getWeather(latitude, longitude); 
        } else { 
            alert('Platsen kunde inte hittas!'); 
        } 
    } catch (error) { 
        alert('Något gick fel när platsen skulle sökas.'); 
    } 
}

/**
 * Hämtar väderinformation (både timvis och daglig) baserat på latitud och longitud.
 * 
 * @param {number} latitude - Breddgrad för platsen.
 * @param {number} longitude - Längdgrad för platsen.
 * @returns {Promise<void>} - En promise som representerar slutförandet av operationen.
 */
async function getWeather(latitude, longitude) {
    let weatherUrlHourly = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,snowfall,precipitation,relative_humidity_2m,wind_speed_10m&timezone=Europe/Stockholm`;
    let weatherUrlDaily = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,relative_humidity_2m_max,relative_humidity_2m_min,wind_speed_10m_max&timezone=Europe/Stockholm`;

    try {
        // Hämta både timvis och daglig väderinformation
        const [responseHourly, responseDaily] = await Promise.all([
            fetch(weatherUrlHourly),
            fetch(weatherUrlDaily)
        ]);

        // Kontrollera om svaret är OK (status 200)
        if (!responseHourly.ok || !responseDaily.ok) {
            const errorTextHourly = await responseHourly.text();
            const errorTextDaily = await responseDaily.text();
            throw new Error(`API-svar: ${responseHourly.status} ${responseHourly.statusText}. Svar: ${errorTextHourly} \nAPI-svar: ${responseDaily.status} ${responseDaily.statusText}. Svar: ${errorTextDaily}`);
        }

        // Läsa svaret som JSON
        const dataHourly = await responseHourly.json();
        const dataDaily = await responseDaily.json();

        console.log('Weather data hourly:', dataHourly);
        console.log('Weather data daily:', dataDaily);

        // Rensa tidigare väderdata
        clearWeatherData();

        // Visa den data vi hämtar beroende på typ (timme eller 7 dagar)
        displayHourlyWeather(dataHourly);
        displayDailyWeather(dataDaily);

    } catch (error) {
        console.error('Fel vid hämtning av väderdata:', error);
    }
}

/**
 * Formaterar en given tidsstämpel till ett läsbart format: "YYYY-MM-DD klockan HH:MM"
 * 
 * @param {string} time - Tidsstämpel i ISO-format (ex: "2025-04-01T11:00:00Z").
 * @returns {string} - Den formaterade tiden som en sträng i formatet "YYYY-MM-DD klockan HH:MM".
 */
function formatTimeToReadableFormat(time) {
    const date = new Date(time);
    
    // Formatera datumet och tiden till önskat format: YYYY-MM-DD klockan HH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Månad (0-indexerad, så +1)
    const day = String(date.getDate()).padStart(2, '0'); // Dag
    const hours = String(date.getHours()).padStart(2, '0'); // Timme
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Minuter

    return `<strong>${year}-${month}-${day} klockan ${hours}:${minutes}</strong>`;
}

/**
 * Hämta koordinater för en plats när användaren klickar på sök-knappen.
 */
document.getElementById('search-btn').addEventListener('click', function() {
    const location = document.getElementById('location-input').value;
    if (location) {
        getCoordinates(location);  // Hämtar koordinater för den angivna platsen
    } else {
        alert('Vänligen ange en plats!');
    }
});

/**
 * Rensar all tidigare väderinformation från användargränssnittet.
 */
function clearWeatherData() {
    // Töm väderinformation från både sektioner
    document.getElementById('hourly-info').innerHTML = '';
    document.getElementById('daily-info').innerHTML = '';
}

/**
 * Visar timvis väderinformation på användargränssnittet.
 * 
 * @param {Object} data - Data som innehåller väderinformation på timnivå.
 */
function displayHourlyWeather(data) {
    const hourlyContainer = document.getElementById('hourly-info');
    const times = data.hourly.time || [];
    const temperatures = data.hourly.temperature_2m || [];
    const precipitations = data.hourly.precipitation || [];
    const humidities = data.hourly.relative_humidity_2m || [];
    const windSpeeds = data.hourly.wind_speed_10m || [];
    const snowfalls = data.hourly.snowfall || [];

    // Skapa en kortfattad väderformat för den första timmen och en expandera-knapp
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    // Filtrera timmar framåt
    const filteredTimes = times.filter((time) => {
        const timeHour = new Date(time).getHours();
        return timeHour >= currentHour;
    });

    const filteredTemperatures = temperatures.filter((_, index) => times[index] >= currentTime.toISOString());
    const filteredPrecipitations = precipitations.filter((_, index) => times[index] >= currentTime.toISOString());
    const filteredHumidities = humidities.filter((_, index) => times[index] >= currentTime.toISOString());
    const filteredWindSpeeds = windSpeeds.filter((_, index) => times[index] >= currentTime.toISOString());
    const filteredSnowfalls = snowfalls.filter((_, index) => times[index] >= currentTime.toISOString());

    // Skapa en kortfattad vädervy och en knapp för att expandera till hela timmen
    const compactHourlyWeather = document.createElement('div');
    compactHourlyWeather.classList.add('weather-hour');
    compactHourlyWeather.innerHTML = `
        <p>${formatTimeToReadableFormat(filteredTimes[0])}</p>
        <p>Temperatur: ${filteredTemperatures[0]}°C</p>
        <p>Vind: ${filteredWindSpeeds[0]} m/s</p>
        <div class="expand-btn" onclick="toggleAllHourlyDetails()">Tryck här för att se fler timmar</div>
        <div class="hourly-details" style="display:none;">
            ${filteredTimes.map((time, index) => {
                return `
                    <div class="hour-detail">
                        <h5>${formatTimeToReadableFormat(time)}</h5>
                        <p>Temperatur: ${filteredTemperatures[index]}°C</p>
                        <p>Regn: ${filteredPrecipitations[index]} mm</p>
                        <p>Luftfuktighet: ${filteredHumidities[index]}%</p>
                        <p>Vind: ${filteredWindSpeeds[index]} m/s</p>
                        <p>Snöfall: ${filteredSnowfalls[index]} cm</p>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    hourlyContainer.appendChild(compactHourlyWeather);
}

/**
 * Växlar visningen av alla element med klassen 'hourly-details'.
 * Om ett element är dolt (display: 'none'), görs det synligt (display: 'block'),
 * och om det är synligt, döljs det.
 * 
 * Funktionen itererar genom alla element med klassen 'hourly-details' och ändrar 
 * deras display-egenskap.
 * 
 * @function
 */
function toggleAllHourlyDetails() {
    const details = document.querySelectorAll('.hourly-details');
    details.forEach(detail => {
        detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
    });
}

/**
 * Visar daglig väderinformation på användargränssnittet.
 * 
 * @param {Object} data - Data som innehåller väderinformation på dagnivå.
 */
function displayDailyWeather(data) {
    const dailyContainer = document.getElementById('daily-info');
    const days = data.daily.time || [];
    const maxTemperatures = data.daily.temperature_2m_max || [];
    const minTemperatures = data.daily.temperature_2m_min || [];
    const precipitations = data.daily.precipitation_sum || [];
    const snowfalls = data.daily.snowfall_sum || [];
    const maxHumidities = data.daily.relative_humidity_2m_max || [];
    const minHumidities = data.daily.relative_humidity_2m_min || [];
    const maxWindSpeeds = data.daily.wind_speed_10m_max || [];

    if (days.length > 0 && maxTemperatures.length > 0) {
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            const maxTemp = maxTemperatures[i];
            const minTemp = minTemperatures[i];
            const precip = precipitations[i];
            const snowfall = snowfalls[i];
            const maxHumidity = maxHumidities[i];
            const minHumidity = minHumidities[i];
            const maxWindSpeed = maxWindSpeeds[i];

            const dailyWeather = document.createElement('div');
            dailyWeather.classList.add('weather-day');
            dailyWeather.innerHTML = `
                <h4>${day}</h4>
                <p>Max temperatur: ${maxTemp}°C</p>
                <p>Min temperatur: ${minTemp}°C</p>
                <div class="expand-btn" onclick="toggleDailyDetails()">Tryck här för att se fler detaljer</div>
                <div class="daily-details" style="display:none;">
                    <p>Regn: ${precip} mm</p>
                    <p>Snöfall: ${snowfall} cm</p>
                    <p>Max luftfuktighet: ${maxHumidity}%</p>
                    <p>Min luftfuktighet: ${minHumidity}%</p>
                    <p>Max vind: ${maxWindSpeed} km/h</p>
                </div>
            `;
            dailyContainer.appendChild(dailyWeather);
        }
    } else {
        dailyContainer.innerHTML = '<p>Ingen 7-dagars väderdata tillgänglig.</p>';
    }
}

/**
 * Växlar visningen av alla element med klassen 'daily-details'.
 * Om ett element är dolt (display: 'none'), görs det synligt (display: 'block'),
 * och om det är synligt, döljs det.
 * 
 * Funktionen itererar genom alla element med klassen 'daily-details' och ändrar 
 * deras display-egenskap.
 * 
 * @function
 */
function toggleDailyDetails() {
    const details = document.querySelectorAll('.daily-details');
    details.forEach(detail => {
        detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
    });
}

