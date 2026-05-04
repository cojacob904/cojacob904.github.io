document.getElementById('getLocationBtn').addEventListener('click', () => {
    const statusText = document.getElementById('statusMessage');
    
    // check gelocation support
    if (!navigator.geolocation) {
        statusText.textContent = "Geolocation is not supported by your browser.";
        return;
    }

    statusText.textContent = "Locating...";

    // get location
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            statusText.textContent = "Location found! Fetching weather...";
            
            // 2. Fetch the weather using the coordinates
            fetchWeatherData(lat, lon);
        },
        (error) => {
            statusText.textContent = `Unable to retrieve your location: ${error.message}`;
        }
    );
});

// async fetch function
async function fetchWeatherData(lat, lon) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&timezone=auto`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        
        const data = await response.json();
        document.getElementById('statusMessage').textContent = "";
        displayWeatherCards(data.daily);

    } catch (error) {
        document.getElementById('statusMessage').textContent = `Failed to fetch weather: ${error.message}`;
    }
}

// function to generate the HTML cards
function displayWeatherCards(dailyData) {
    const container = document.getElementById('weatherContainer');
    container.innerHTML = ""; // Clear previous results

    for (let i = 0; i < dailyData.time.length; i++) {
        
        // convert date to weekday
        const dateObj = new Date(dailyData.time[i] + 'T00:00:00');
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        // format sunrise and sunset times
        const sunriseTime = new Date(dailyData.sunrise[i]).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const sunsetTime = new Date(dailyData.sunset[i]).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        // get highs and lows
        const highTemp = Math.round(dailyData.temperature_2m_max[i]);
        const lowTemp = Math.round(dailyData.temperature_2m_min[i]);

        // create card
        const card = document.createElement('div');
        card.className = 'weather-card';
        
        card.innerHTML = `
            <h3>${dayName}</h3>
            <p>High: <span class="temp-high">${highTemp}&deg;F</span></p>
            <p>Low: <span class="temp-low">${lowTemp}&deg;F</span></p>
            <div class="sun-times">
                <p>Sunrise: ${sunriseTime}</p>
                <p>Sunset: ${sunsetTime}</p>
            </div>
        `;

        container.appendChild(card);
    }
}