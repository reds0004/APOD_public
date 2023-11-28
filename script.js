// Event listener for DOMContentLoaded to initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchAPOD(); // Fetches today's APOD by default
    setupEventListeners();
    displayFavorites(); // Populate the favorites list on page load
    document.getElementById('clearFavoritesBtn').addEventListener('click', clearAllFavorites);
    document.getElementById('fav-button').addEventListener('click', toggleFullscreenNav);
});

// Fetches APOD data from the NASA API or local storage
function fetchAPOD(date = new Date().toISOString().slice(0, 10)) {
    const API_KEY = 'uZmky08RKL1lxSE5PeJHPkZcupsVzRH3Tp3kzdhm';
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let favoriteData = favorites.find(fav => fav.date === date);

    if (favoriteData) {
        updateAPODDisplay(favoriteData);
    } else {
        const APODurl = `https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`;
        fetch(APODurl)
            .then(response => response.json())
            .then(data => {
                // trying to fetch default date too close to midnight causes grief
                console.log("Fetching APOD for date:", date);
                updateAPODDisplay({
                    date: data.date,
                    title: data.title,
                    url: data.url,
                    hdurl: data.hdurl || data.url,
                    explanation: data.explanation
                });
            })
            .catch(error => console.error('Error fetching APOD:', error));
    }
}

// Updates the main display area with APOD data
function updateAPODDisplay(apodData) {
    const apodPicture = document.getElementById('apodPicture');
    apodPicture.src = apodData.url;
    apodPicture.alt = apodData.title;
    apodPicture.setAttribute('data-hdurl', apodData.hdurl);

    document.getElementById('apodDate').textContent = apodData.date;
    document.getElementById('apodName').textContent = apodData.title;
    document.getElementById('apodCaption').textContent = apodData.explanation;

    updateFavoriteIcon(apodData.date);

    // Set click event listener for the APOD picture to open the modal
    apodPicture.onclick = () => openModal(apodData.hdurl);
}

// Sets up event listeners for various elements
function setupEventListeners() {
    document.getElementById('svg-heart').addEventListener('click', () => toggleFavoriteStatus('favorite'));
    document.getElementById('svg-trash').addEventListener('click', () => toggleFavoriteStatus('unfavorite'));
    document.getElementById('date-picker-search').addEventListener('click', handleDatePickerSearch);
}

function handleDatePickerSearch() {
    const selectedDate = document.getElementById('datePicker').value;
    if (selectedDate) {
        fetchAPOD(selectedDate);
    } else {
        fetchAPOD(); // Calls fetchAPOD without a date, which will default to today's date
    }
}

// Toggles the favoriting status of an APOD
function toggleFavoriteStatus(action) {
    const apodDate = document.getElementById('apodDate').textContent;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let isFavorited = favorites.some(favorite => favorite.date === apodDate);

    if (!isFavorited) {
        favorites.push(collectApodData()); // Add to favorites
    } else {
        favorites = favorites.filter(favorite => favorite.date !== apodDate); // Remove from favorites
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    updateFavoriteIcon(apodDate); // Update the heart icon
}

// Collects current APOD data from the DOM
function collectApodData() {
    return {
        date: document.getElementById('apodDate').textContent,
        title: document.getElementById('apodName').textContent,
        url: document.getElementById('apodPicture').src,
        hdurl: document.getElementById('apodPicture').getAttribute('data-hdurl'),
        explanation: document.getElementById('apodCaption').textContent
    };
}

function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesList = document.getElementById('favourites-list');
    favoritesList.innerHTML = '';
    favorites.forEach(favorite => {
        let li = document.createElement('li');
        let button = document.createElement('button');
        
        // Corrected: Attach an event listener to the button
        button.addEventListener('click', () => {
            recallFavoriteData(favorite);
            closeSidebar(); 
        });
        
        let img = document.createElement('img');
        img.className = "thumbnail";
        img.src = favorite.url;
        img.alt = favorite.title;

        let title = document.createElement('h3');
        title.textContent = favorite.title;

        let date = document.createElement('p');
        date.textContent = favorite.date;

        button.appendChild(img);
        button.appendChild(title);
        button.appendChild(date);
        li.appendChild(button);
        favoritesList.appendChild(li);
    });
}

// Updates the favorite icon based on whether the current APOD is favorited
function updateFavoriteIcon(apodDate) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let isFavorited = favorites.some(favorite => favorite.date === apodDate);

    const heartIcon = document.getElementById('svg-heart').querySelector('path');
    heartIcon.style.fill = isFavorited ? '#E9F4FD' : 'none';
}

// Recalls and displays favorite APOD data
function recallFavoriteData(favorite) {
    updateAPODDisplay(favorite);
    updateFavoriteIcon(favorite.date);
}

// Clears all favorites from local storage and updates the display
function clearAllFavorites() {
    localStorage.removeItem('favorites');
    displayFavorites(); // Refresh the display to show that the favorites have been cleared

    // update favourite status of current
    const currentApodDate = document.getElementById('apodDate').textContent;
    updateFavoriteIcon(currentApodDate);
}

// Handles displaying the HD image in a modal
function openModal(hdUrl) {
    const modal = document.getElementById("myModal");
    const modalImg = document.getElementById("hdImage");
    const captionText = document.getElementById("caption");

    modal.style.display = "block";
    modalImg.src = hdUrl;
    captionText.innerHTML = document.getElementById("apodCaption").textContent;

    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() { 
      modal.style.display = "none";
    }
}

function toggleFullscreenNav() {
    const orangeNav = document.querySelector('.orange-nav');
    const header = document.querySelector('.blue-header');
    const article = document.querySelector('.blue-article');
    const favButton = document.getElementById('fav-button');
    const favList = document.getElementById ('favourites-list');

    orangeNav.classList.toggle('fullscreen-nav');

    if (orangeNav.classList.contains('fullscreen-nav')) {
        header.classList.add('hide-on-fullscreen');
        article.classList.add('hide-on-fullscreen');
        favList.classList.add('fs-grid');
        favButton.innerHTML = 'Favourites <';
    } else {
        closeSidebar();
    }
}

function closeSidebar() {
    const header = document.querySelector('.blue-header');
    const article = document.querySelector('.blue-article');
    const favButton = document.getElementById('fav-button');
    const orangeNav = document.querySelector('.orange-nav');
    const favList = document.getElementById ('favourites-list')


    header.classList.remove('hide-on-fullscreen');
    article.classList.remove('hide-on-fullscreen');
    orangeNav.classList.remove('fullscreen-nav');
    orangeNav.classList.remove('fs-grid');
    favList.classList.remove('fs-grid');
    favButton.innerHTML = 'Favourites >';
}