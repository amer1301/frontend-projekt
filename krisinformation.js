async function fetchTopStories() {
    try {
        const response = await fetch('https://api.krisinformation.se/v3/topstories?language=sv');
        const data = await response.json();

        console.log(data); // Logga datan för felsökning

        // Kontrollera om API-svaret innehåller nyheter
        const newsContainer = document.getElementById('news-container');
        if (newsContainer) {
            newsContainer.innerHTML = "<h2>Senaste Nyheterna</h2>";

            // Kontrollera om nyheterna är en array och att den innehåller objekt
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(story => {
                    const storyElement = document.createElement("div");
                    storyElement.classList.add("news-item");

                    // Skapa en länk till artikeln om den finns
                    const link = story.Links && story.Links.length > 0 ? story.Links[0].Url : "#";

                    // Visa nyheten med titel, länk och beskrivning
                    storyElement.innerHTML = `
                        <h3><a href="${link}" target="_blank">${story.Headline}</a></h3>
                        <p>${story.Preamble || "Ingen beskrivning tillgänglig."}</p>
                        <img src="${story.ImageLink}" alt="${story.Headline}" style="width: 100%; max-width: 600px;">
                    `;
                    newsContainer.appendChild(storyElement);
                });
            } else {
                newsContainer.innerHTML += "<p>Inga nyheter hittades just nu.</p>";
            }
        }
    } catch (error) {
        console.error('Fel vid hämtning av nyheter:', error);
    }
}
async function fetchCrisisInfo() {
    try {
        const responses = await Promise.all([
            fetch('https://api.krisinformation.se/v3/testvmas'),
            fetch('https://api.krisinformation.se/v3/notifications'),
            fetch('https://api.krisinformation.se/v3/features')
        ]);
        
        const [testvmasData, notificationsData, featuresData] = await Promise.all(responses.map(res => res.json()));

        const crisisContainer = document.getElementById('crisis-info-container');
        if (crisisContainer) {
            crisisContainer.innerHTML = "<h2>Viktiga Meddelanden och Funktioner</h2>";

            // Lägg till testvmas data
            if (Array.isArray(testvmasData) && testvmasData.length > 0) {
                testvmasData.forEach(item => {
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("crisis-item");
                    itemElement.innerHTML = `
                        <h3>${item.Headline}</h3>
                        <p>${item.PushMessage}</p>
                        <p><strong>Uppdaterad:</strong> ${item.Updated}</p>
                    `;
                    crisisContainer.appendChild(itemElement);
                });
            } else {
                crisisContainer.innerHTML += "<p>Inga viktiga meddelanden hittades.</p>";
            }

            // Lägg till notifications data
            if (Array.isArray(notificationsData) && notificationsData.length > 0) {
                notificationsData.forEach(item => {
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("notification-item");
                    itemElement.innerHTML = `
                        <h3>${item.Headline}</h3>
                        <p>${item.BodyText}</p>
                        <p><strong>Uppdaterad:</strong> ${item.Updated}</p>
                    `;
                    crisisContainer.appendChild(itemElement);
                });
            } else {
                crisisContainer.innerHTML += "<p>Inga notifikationer hittades.</p>";
            }

            // Lägg till features data
            if (Array.isArray(featuresData) && featuresData.length > 0) {
                featuresData.forEach(item => {
                    const itemElement = document.createElement("div");
                    itemElement.classList.add("feature-item");
                    itemElement.innerHTML = `
                        <h3>${item.Headline}</h3>
                        <p>${item.Preamble}</p>
                        <img src="${item.ImageLink}" alt="${item.Headline}" style="width: 100%; max-width: 600px;">
                    `;
                    crisisContainer.appendChild(itemElement);
                });
            } else {
                crisisContainer.innerHTML += "<p>Inga funktioner hittades.</p>";
            }
        }
    } catch (error) {
        console.error('Fel vid hämtning av krisinformation:', error);
    }
}

// Kör både fetchTopStories och fetchCrisisInfo när sidan har laddats
window.onload = function() {
    fetchTopStories();
    fetchCrisisInfo();
};