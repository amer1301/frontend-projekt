/**
 * Hanterar visningen och döljer hamburgermenyn på webbplatsen.
 * Funktionen lyssnar på klick på hamburgermenyn och togglar visningen av menyn och ikonerna.
 * Den hanterar även att menyn döljs när ett menyalternativ klickas på.
 * 
 * @function
 */
document.addEventListener('DOMContentLoaded', () => { 
    const menuToggle = document.getElementById('menu-toggle'); 
    const navMenu = document.getElementById('nav-menu'); 
    const bars = menuToggle.querySelector('.bars'); 
    const close = menuToggle.querySelector('.close'); 

    if (menuToggle && navMenu) { 

         /**
         * Lägg till en eventlyssnare för hamburgermenyn som togglar mellan att visa och dölja menyn.
         * Den togglar också visningen av hamburgermenyn och stängningsikonen.
         * 
         * @event
         * @param {Event} event - Klickhändelsen på hamburgermenyn.
         */
        menuToggle.addEventListener('click', () => { 

            // Toggla 'active' klassen för att visa/dölja menyn 
            navMenu.classList.toggle('active'); 

            // Toggla visningen av hamburgermenyn och stängningsikonen 
            bars.style.display = bars.style.display === 'none' ? 'flex' : 'none'; 
            close.style.display = close.style.display === 'none' ? 'flex' : 'none'; 
        }); 

         /**
         * Lägg till en eventlyssnare för varje menyalternativ för att dölja menyn när ett alternativ klickas.
         * Detta återställer även visningen av hamburgermenyn.
         * 
         * @event
         * @param {Event} event - Klickhändelsen på menyalternativet.
         */
        const menuItems = document.querySelectorAll('#nav-menu a'); 
        menuItems.forEach(item => { 
            item.addEventListener('click', () => { 
                navMenu.classList.remove('active'); 
                bars.style.display = 'flex'; 
                close.style.display = 'none'; 
            }); 
        }); 

    } else { 
        console.log('Menyelementen saknas!'); 
    }
});