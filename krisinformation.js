/**
 * Hämtar de senaste nyheterna från Krisinformation.se och visar dem på webbsidan.
 * Nyheterna hämtas från API:et och presenteras med rubrik, länk, beskrivning och bild.
 * 
 * @async
 * @function fetchTopStories
 * @throws {Error} Om det sker ett fel vid hämtning eller hantering av API-data.
 */
async function fetchTopStories() {
    try {
        const response = await fetch('https://api.krisinformation.se/v3/topstories?language=sv');
        const data = await response.json();

        console.log(data); // Logga datan för felsökning

        // Kontrollera om API-svaret innehåller nyheter
        const newsContainer = document.getElementById('news-container');
        if (newsContainer) {

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

/**
 * Hämtar viktig krisinformation och framtida händelser från Krisinformation.se och visar dem på webbsidan.
 * Hämtar både notifikationer och framtida händelser, filtrerar bort testdata och gamla inlägg.
 * 
 * @async
 * @function fetchCrisisInfo
 * @throws {Error} Om det sker ett fel vid hämtning eller hantering av API-data.
 */
async function fetchCrisisInfo() {
    try {
        const responses = await Promise.all([
            fetch('https://api.krisinformation.se/v3/notifications'),
            fetch('https://api.krisinformation.se/v3/features')
        ]);
        
        const [notificationsData, featuresData] = await Promise.all(responses.map(res => res.json()));

        const crisisContainer = document.getElementById('crisis-info-container');
        if (crisisContainer) {
            crisisContainer.innerHTML = "<h2>Viktiga meddelanden och framtida händelser</h2>";

             /**
             * Filtrerar bort alla poster med rubriker som innehåller ordet "Test".
             * 
             * @param {Array} data - Listan med notifikationer eller händelser.
             * @returns {Array} - Filtrerad lista utan poster som innehåller "Test".
             */
            const filterTestHeadlines = (data) => {
                return data.filter(item => !item.Headline.toLowerCase().includes("test"));
            };

             /**
             * Filtrerar bort gamla poster baserat på uppdateringsdatum.
             * Endast framtida händelser behålls.
             * 
             * @param {Array} data - Listan med notifikationer eller händelser.
             * @returns {Array} - Filtrerad lista med endast framtida händelser.
             */
            const filterFutureData = (data) => {
                const currentDate = new Date();
                return data.filter(item => {
                    const updatedDate = new Date(item.Updated);
                    return updatedDate > currentDate; // Filtrera bort historiska poster
                });
            };

            // Filtrera notificationsData för "Test"-rubriker och framtida poster
            let filteredNotifications = filterTestHeadlines(notificationsData);
            filteredNotifications = filterFutureData(filteredNotifications);

            // Lägg till notifications data
            if (Array.isArray(filteredNotifications) && filteredNotifications.length > 0) {
                filteredNotifications.forEach(item => {
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
                crisisContainer.innerHTML += "<p>Inga meddelanden hittades.</p>";
            }

            // Filtrera och lägg till features data för framtida händelser
            const recentFeaturesData = filterFutureData(featuresData);
            if (Array.isArray(recentFeaturesData) && recentFeaturesData.length > 0) {
                recentFeaturesData.forEach(item => {
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
                crisisContainer.innerHTML += "<p>Inga framtida händelser hittades.</p>";
            }
        }
    } catch (error) {
        console.error('Fel vid hämtning av krisinformation:', error);
    }
}


/**
 * Kör både `fetchTopStories` och `fetchCrisisInfo` när sidan har laddats.
 * Funktionerna hämtar och visar de senaste nyheterna och viktig krisinformation på webbsidan.
 * 
 * @function
 */
window.onload = function() {
    fetchTopStories();
    fetchCrisisInfo();
};
