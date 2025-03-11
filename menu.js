document.addEventListener('DOMContentLoaded', () => { 
    const menuToggle = document.getElementById('menu-toggle'); 
    const navMenu = document.getElementById('nav-menu'); 
    const bars = menuToggle.querySelector('.bars'); 
    const close = menuToggle.querySelector('.close'); 

    if (menuToggle && navMenu) { 

        // Lägg till en eventlyssnare för hamburgermenyn 
        menuToggle.addEventListener('click', () => { 

            // Toggla 'active' klassen för att visa/dölja menyn 
            navMenu.classList.toggle('active'); 

            // Toggla visningen av hamburgermenyn och stängningsikonen 
            bars.style.display = bars.style.display === 'none' ? 'flex' : 'none'; 
            close.style.display = close.style.display === 'none' ? 'flex' : 'none'; 
        }); 

        // När ett menyalternativ klickas på, dölja menyn
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