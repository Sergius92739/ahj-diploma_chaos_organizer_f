export default class Geolocation {

  static getLocation(callback) {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(Geolocation.succesHandler(position)),
          (error) => resolve(Geolocation.errorHandler(error, callback)),
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0,
          },
        );
      } else {
        const info = 'Ваш браузер не поддерживает геолокацию, смените браузер и повторите попытку.';
        resolve(callback(info));
      }
    })
  }

  static succesHandler(position) {
    const { latitude, longitude } = position.coords;
    const coords = {
      latitude: +latitude.toFixed(5),
      longitude: +longitude.toFixed(5),
    }
    return coords;
  }

  static errorHandler(error, callback) {
    let info;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        info = 'Настройки текущего браузера запрещают определение вашего местоположения, измените настройки конфидициальности в текущем браузере и повторите попытку.'
        return callback(info);
      case error.POSITION_UNAVAILABLE:
        info = 'Информация о вашем текущем местоположении недоступна, повторите попытку позже';
        return callback(info);
      case error.TIMEOUT:
        info = 'Истекло время ожидания, поскольку информация о геолокации не была получена в отведенное время, повторите попытку';
        return callback(info);
      default:
        info = 'Произошла неизвестная ошибка';
        return callback(info);
    }
  }
}