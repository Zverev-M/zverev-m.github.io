async function addCity() {
    var el = document.querySelector('#name');
    var city = el.value;
    el.value = '';

    var cityList = localStorage.getItem('cityList');
    if (cityList) {
        cityList = JSON.parse(cityList);
        cityList.push(city.toLowerCase());
    } else {
        cityList = Array.of(city);
    }

    var result = await createNewFavoriteCity(city);
    if (result) {
        localStorage.setItem('cityList', JSON.stringify(cityList));
    }
}

function deleteCity(el, cityName) {
    el.remove();
    var cityList = JSON.parse(localStorage.getItem("cityList"));
    cityList.splice(cityList.indexOf(cityName.toLowerCase()), 1);
    localStorage.setItem("cityList", JSON.stringify(cityList));
}

async function createNewFavoriteCity(city) {
    var el = document.createElement('li');
    el.innerHTML = '<div class="other-city">\n' +
        '                    <h3 class="grid-element-left other-city-name">Moscow</h3>\n' +
        '                    <span class="other-city-temperature grid-element-center">5&#8451;</span>\n' +
        '                    <img class="other-city-icon grid-element-center" src="weather.png">\n' +
        '                    <button class="round grid-element-right delete">X</button>\n' +
        '                    <ul class="other-city-list">\n' +
        '                        <li class="inner-list"><span class="point">Ветер</span> <span class="value speed">5.0 m/s</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Облачность</span> <span class="value description">Broken Clouds</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Давление</span> <span class="value pressure">1000 hpa</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Влажность</span> <span class="value humidity">50%</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Координаты</span> <span class="value coords">[0.00, 0.00]</span></li>\n' +
        '                    </ul>\n' +
        '                </div>'

    var result = await updateAdditionalCity(city, el);
    if (result) {
        document.querySelector('#fvr').appendChild(el);
        return true;
    }

    return false;
}

async function updateCurrentCity (el, url) {
    var response = await fetch(url);
    var data;

    if (response.ok) {
        data = await response.json();

        el.querySelector('h2').textContent = data.name;
        el.querySelector('span.current-city-temperature').textContent = Math.round(data.main.temp - 273) + "℃";
        el.querySelector('img.current-city-icon').src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
        el.querySelector('span.speed').textContent = data.wind.speed + " м/с";
        el.querySelector('span.description').textContent = data.weather[0].description;
        el.querySelector('span.pressure').textContent = data.main.pressure + " мм. рт. ст.";
        el.querySelector('span.humidity').textContent = data.main.humidity + "%";
        el.querySelector('span.coords').textContent = "[" + (Math.floor(data.coord.lat * 100)/ 100) + ", " + (Math.floor(data.coord.lon * 100) / 100) + "]";
    } else {
        alert('Ошибка загрузки');
    }
}

async function updateAdditionalCity (city, el) {
    var response = await fetch(getURLByName(city));
    var data;
    if (response.ok) {
        data = await response.json();

        el.querySelector('h3').textContent = data.name;
        el.querySelector('span.other-city-temperature').textContent = Math.round(data.main.temp - 273) + "℃";
        el.querySelector('img').src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
        el.querySelector('span.speed').textContent = data.wind.speed + " м/с";
        el.querySelector('span.description').textContent = data.weather[0].description;
        el.querySelector('span.pressure').textContent = data.main.pressure + " мм. рт. ст.";
        el.querySelector('span.humidity').textContent = data.main.humidity + "%";
        el.querySelector('span.coords').textContent = "[" + (Math.floor(data.coord.lat * 100)/ 100) + ", " + (Math.floor(data.coord.lon * 100) / 100) + "]";

        el.querySelector('button.delete').addEventListener('click', () => deleteCity(el, data.name));

        return true;
    } else {
        alert('Город не найден');
        return false;
    }
}

function getURLByName (city) {
    return `http://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=94d4575428dc92002c2aca36ad6f2ca9`;
}

function updateByCoord () {
    var result = '';

    navigator.geolocation.getCurrentPosition(
        function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;

            updateCurrentCity(document.querySelector('div.current-city'), `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=ru&appid=94d4575428dc92002c2aca36ad6f2ca9`);
        },

        function () {
            updateCurrentCity(document.querySelector('div.current-city'),`http://api.openweathermap.org/data/2.5/weather?q=москва&lang=ru&appid=94d4575428dc92002c2aca36ad6f2ca9`);
        }
    );

    return result;
}

function loadCityList () {
    var cityList = localStorage.getItem("cityList");
    if (cityList) {
        for (let city of JSON.parse(cityList)) {
            createNewFavoriteCity(city);
        }
    }
}

function loadPage () {
    document.querySelector('#add').addEventListener('click', addCity);
    document.querySelector('button.update').addEventListener('click', updateByCoord);
    updateByCoord();
    loadCityList();

}

window.addEventListener('load', loadPage);