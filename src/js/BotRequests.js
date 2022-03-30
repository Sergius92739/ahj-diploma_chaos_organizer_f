import Geolocation from "./Geolocation";
import Templates from "./Templates";

export default class BotRequests {
  constructor(mainInput, encryption, url) {
    this.mainInput = mainInput;
    this.crypto = encryption;
    this.baseURL = url;
    this.weatherKey = 'eca3c39a199c6467336e7a5e2a1db49e';
  }

  async inputProcessing() {
    let content;
    let encryption;
    if (this.crypto.encryption) {
      content = this.crypto.encryptMessage(this.mainInput.textContent, this.crypto.encryptPassword)
      encryption = true;
    } else {
      content = this.mainInput.textContent;
      encryption = false;
    }
    if (this.mainInput.textContent.trim() === '@chaos: погода') {
      content = await BotRequests.getWeather(this.showPopup, this.weatherKey);
    }
    if (this.mainInput.textContent.trim() === '@chaos: курс') {
      content = await BotRequests.getExchangeRates();
    }
    if (this.mainInput.textContent.trim() === '@chaos: фраза') {
      content = await BotRequests.getPhrase(this.baseURL)
    }
    if (/^@chaos:\s(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])$/.test(this.mainInput.textContent.trim())) {
      const date = this.mainInput.textContent.trim().split(' ')[1];
      const object = {
        month: date.split('/')[1],
        day: date.split('/')[0],
      }
      const facts = await BotRequests.getFactsNumber(object);
      content = { facts, this_day: object };
    }
    return { content, encryption }
  }

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

  static chaosMesEngine(message) {
    let content;
    let bodyID;
    if (message.latitude && message.longitude) {
      content = `<span class="coords">Координаты: [${message.latitude}, ${message.longitude}]</span><a class="coords-btn" href="http://www.google.com/maps/place/${message.latitude},${message.longitude}" target="_blank"></a>`
    }
    if (message.weather) {
      content = Templates.weatherMarkup(message);
    }
    if (message.Valute) {
      content = Templates.exchangeMarkup(message);
      bodyID = 'chaos';
    }
    if (message.facts) {
      let facts = '';
      message.facts.selected.forEach((item) => {
        facts += `<div>В ${item.year} году ${item.text}</div><br>`;
      });
      content = `<div>
      <h3>В этот день ( ${message.this_day.day}.${message.this_day.month} ):</h3><br>
      ${facts}</div>`
    }
    return {
      content,
      bodyID,
    }
  }
}