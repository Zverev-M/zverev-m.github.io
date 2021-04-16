async function addCity() {
    var el = document.querySelector('#name');
    var city = el.value;

    if (!city) {
        alert("Город не указан");
        return;
    }

    el.value = '';

    let result = await createNewFavoriteCity(city, 1);

    if (result) {
        try {
            await fetch('http://localhost:3000/favourites?city=' + city, {method: 'POST'})

        } catch (e) {
            alert("Проблемы с добавлением города");
        }
    }
}

async function deleteCity(el, cityName) {
    el.querySelector('button').disabled = true;

    try {
        await fetch('http://localhost:3000/favourites?city=' + cityName.toLowerCase(),
            {
                method: 'DELETE'
            })
            .then(res => {
                if (res.status === 200) {
                    el.remove();
                }
            })
    } catch (err) {
        el.querySelector('button').disabled = false;
    }
}

async function createNewFavoriteCity(city, p) {
    var el = document.querySelector('#example').content.cloneNode(true);
    document.querySelector('#fvr').append(el);
    el = document.querySelector('#fvr').lastElementChild;

    el.style.display = 'grid';

    var result = await updateAdditionalCity(city, el, p);

    if (result) {
        el.style.display = 'grid';
        return true;
    }

    return false;
}

async function updateCurrentCity (el, url) {
    try {
        var response = await fetch(url);
        var data;

        if (response.ok) {
            data = await response.json();

            el.querySelector('h2').textContent = data.name;
            el.querySelector('span.current-city-temperature').textContent = Math.round(data.main.temp - 273) + "℃";
            el.querySelector('img.current-city-icon').src = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
            el.querySelector('span.speed').textContent = data.wind.speed + " m/s";
            el.querySelector('span.description').textContent = data.weather[0].main;
            el.querySelector('span.pressure').textContent = data.main.pressure + " hpa";
            el.querySelector('span.humidity').textContent = data.main.humidity + "%";
            el.querySelector('span.coords').textContent = "[" + (Math.floor(data.coord.lat * 100)/ 100) + ", " + (Math.floor(data.coord.lon * 100) / 100) + "]";
        } else {
            el.querySelector('h2').textContent = 'Ошибка загрузки';
        }

    } catch (e) {
        el.querySelector('h2').textContent = 'Ошибка загрузки';
        el.querySelector('span.current-city-temperature').textContent = "...";
        el.querySelector('img.current-city-icon').src = "weather.png";
        el.querySelector('span.speed').textContent = "...";
        el.querySelector('span.description').textContent = "...";
        el.querySelector('span.pressure').textContent = "...";
        el.querySelector('span.humidity').textContent = "...";
        el.querySelector('span.coords').textContent = "...";
    }
}

async function updateAdditionalCity (city, el, p) {
    try {
        var response = await fetch(getURLByName(city));
        var data;
        if (response.status === 200) {
            data = await response.json();

            if (data.cod === "404") {
                el.style.display = 'none';
                alert('Город не найден');
                return false;
            }

            el.style.display = 'grid';

            el.querySelector('h3').textContent = data.name;
            el.querySelector('span.other-city-temperature').textContent = Math.round(data.main.temp - 273) + "℃";
            el.querySelector('img').src = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
            el.querySelector('span.speed').textContent = data.wind.speed + " m/s";
            el.querySelector('span.description').textContent = data.weather[0].main;
            el.querySelector('span.pressure').textContent = data.main.pressure + " hpa";
            el.querySelector('span.humidity').textContent = data.main.humidity + "%";
            el.querySelector('span.coords').textContent = "[" + (Math.floor(data.coord.lat * 100)/ 100) + ", " + (Math.floor(data.coord.lon * 100) / 100) + "]";

            el.querySelector('button.delete').addEventListener('click', () => deleteCity(el, data.name));

            return true;
        } else {
            alert('Город не найден');
            return false;
        }
    } catch (e) {
        el.querySelector('h3').textContent = "Ошибка загрузки";
        if (p === 1) {
            alert("Невозможно добавить город");
        }
        return false;
    }
}

function getURLByName (city) {
    return `http://localhost:3000/weather/city?q=${city}`;
}

function updateByCoord () {
    var result = '';

    navigator.geolocation.getCurrentPosition(
        function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            updateCurrentCity(document.querySelector('div.current-city'), `http://localhost:3000/weather/coordinates?lat=${lat}&lon=${lon}`);
        },

        function () {
            updateCurrentCity(document.querySelector('div.current-city'),`http://localhost:3000/weather/city?q=москва`);
        }
    );

    return result;
}

async function getCityList () {
    let cityList;
    await fetch('http://localhost:3000/favourites')
        .then(response => response.json())
        .then(data => {
            cityList = data;
        })
    return cityList;
}

async function loadCityList () {
    var cityList = await getCityList();
    if (cityList) {
        for (let city of cityList) {
            createNewFavoriteCity(city, 0);
        }
    }
}

function loadPage () {
    document.querySelector('form.field-and-button').addEventListener('submit', (event) => {
        event.preventDefault();
        addCity();
    });
    document.querySelector('button.update').addEventListener('click', updateByCoord);
    updateByCoord();
    loadCityList();

}

window.addEventListener('load', loadPage);