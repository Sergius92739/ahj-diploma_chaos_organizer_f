import LoginPage from "./LoginPage";

const loginPage = new LoginPage(document.querySelector('.app'));

loginPage.init();

/**
 * base: "stations"
clouds: {all: 75}
cod: 200
coord: {lon: 37.2666, lat: 55.6194}
dt: 1643476461
id: 857689
main: {temp: 268.79, feels_like: 265.93, temp_min: 267.72, temp_max: 269.25, pressure: 1004, …}
name: "Внуково"
snow: {1h: 0.24}
sys: {type: 2, id: 47653, country: 'RU', sunrise: 1643434208, sunset: 1643464662}
timezone: 10800
visibility: 2500
weather: Array(1)
0: {id: 620, main: 'Snow', description: 'небольшой снегопад', icon: '13n'}
length: 1
[[Prototype]]: Array(0)
wind: {speed: 1.79, deg: 310, gust: 0}
 */