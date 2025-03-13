# Trafik- och väderprognos samt krisinformation med parcel och Node.js
**Frontend-projekt** ger användare en enkel och interaktiv upplevelse för att ta del av trafikstörningar och väderprognoser ett valt område samt de senaste nyheterna från krisinformation. Webbplatsen använder OpenStreetMap API för att hämta koordinater och kombinerar dessa med data från externa API:er för trafik och väderprognoser för att skapa en mashup. 

### Använda API:er
Webbplatsen använder följande externa API:er för att hämta trafikstörningar, väderprognoser och krisinformation:

- **OpenStreetMap API:** Används för att hämta användarens koordinater och visa kartor.
- **Trafik-API (Sveriges radio API):** Hämta aktuell information om trafikstörningar i det valda området.
- **Väder-API (Open-meteo API):** Hämta väderprognos för det valda området.
- **Krisinformation API:** Hämtar nyheter för krisinformation från svenska myndigheter

Dessa API:er samverkar för att visa relevant information för användaren baserat på deras geografiska position samt allmännyttig krisinformation.

### Dokumentation av JavaScript-kod med JSDoc
All JavaScript-kod i detta projekt är dokumenterad med JSDoc för att ge en tydlig översikt över funktioner och parametrar.


### **Automatiserad arbetsprocess och publicering**
För att uppfylla kravet om en automatiserad arbetsprocess har verktyget Parcel använts för att bygga och optimera webbplatsen. Git användes för versionshantering och Netlify för automatisk publicering.

### Steg för installation

1. Klona detta repo:

    ```bash
    git clone https://github.com/amer1301/frontend-projekt.git
    cd demowebbplats
    ```

2. Installera beroenden:

    ```bash
    npm install
    ```

3. Starta webbplatsen:

    ```bash
    npm run start
    ```