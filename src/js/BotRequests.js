import Geolocation from "./Geolocation";

export default class BotRequests {
  
  static async getPhrase(url) {
    const request = await fetch(`${url}/phrase`);
    const response = await request.json();
    if (response.success) {
      return response.data;
    }
    return 'Ошибка сервера'
  }

  static async getWeather(callback, weatherKey) {
    const location = await Geolocation.getLocation(callback);
    const request = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&lang=ru&appid=${weatherKey}`);
    const response = await request.json();
    return response;
  }

  static async getExchangeRates() {
    const request = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const response = await request.json();
    return response;
  }

  static async getFactsNumber(object) {
    const request = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/ru/onthisday/selected/${object.month}/${object.day}`);
    const response = await request.json();
    return response;
  }
}