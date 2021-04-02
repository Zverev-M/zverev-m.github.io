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

    var result = await createNewFavoriteCity(city, 1);
    if (result) {
        localStorage.setItem('cityList', JSON.stringify(cityList));
    }
}

function deleteCity(el, cityName) {
    el.querySelector('button').disabled = true;

    var cityList = JSON.parse(localStorage.getItem("cityList"));
    cityList.splice(cityList.indexOf(cityName.toLowerCase()), 1);
    localStorage.setItem("cityList", JSON.stringify(cityList));

    el.remove();
}

async function createNewFavoriteCity(city, p) {
    var el = document.createElement('li');
    el.innerHTML = '<div class="other-city">\n' +
        '                    <h3 class="grid-element-left other-city-name">...</h3>\n' +
        '                    <span class="other-city-temperature grid-element-center">...</span>\n' +
        '                    <img class="other-city-icon grid-element-center" src="weather.png">\n' +
        '                    <button class="round grid-element-right delete">X</button>\n' +
        '                    <ul class="other-city-list">\n' +
        '                        <li class="inner-list"><span class="point">Ветер</span> <span class="value speed">...</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Осадки</span> <span class="value description">...</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Давление</span> <span class="value pressure">...</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Влажность</span> <span class="value humidity">...</span></li>\n' +
        '                        <li class="inner-list"><span class="point">Координаты</span> <span class="value coords">...</span></li>\n' +
        '                    </ul>\n' +
        '                </div>'

    if (p === 1) {
        el.style.display = 'none';
    }

    document.querySelector('#fvr').appendChild(el);
    el = document.querySelector('#fvr').lastElementChild;

    var result = await updateAdditionalCity(city, el);

    if (result) {
        el.style.display = 'grid';
        return true;
    }

    return false;
}

async function updateCurrentCity (el, url) {
    var response = await fetch(url);
    var data;

    if (response.status === 200) {
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
        alert('Ошибка загрузки');
    }
}

async function updateAdditionalCity (city, el) {
    try {
        var response = await fetch(getURLByName(city));
        var data;
        if (response.status === 200) {
            data = await response.json();

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
        return false;
    }

}

function getURLByName (city) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=94d4575428dc92002c2aca36ad6f2ca9`;
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
            updateCurrentCity(document.querySelector('div.current-city'),`https://api.openweathermap.org/data/2.5/weather?q=москва&lang=ru&appid=94d4575428dc92002c2aca36ad6f2ca9`);
        }
    );

    return result;
}

function loadCityList () {
    var cityList = localStorage.getItem("cityList");
    if (cityList) {
        for (let city of JSON.parse(cityList)) {
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