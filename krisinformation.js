async function fetchTopStories() {
    try {
        const response = await fetch('https://api.krisinformation.se/v3/topstories?language=sv');
        const data = await response.json();

        console.log(data); // Logga datan för felsökning

        // Kontrollera om API-svaret innehåller nyheter
        const newsContainer = document.getElementById('news-container');
        if (newsContainer) {
            newsContainer.innerHTML = "<h2>Senaste Nyheterna:</h2>";

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

// Kör funktionen när sidan har laddats
window.onload = fetchTopStories;
