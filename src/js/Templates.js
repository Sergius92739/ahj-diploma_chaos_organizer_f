import Utils from "./utils/utils";

export default class Templates {
  static exchangeMarkup(data) {
    const { Valute } = data;
    return `<div class="exchange">
    <div class="exchange__title">Курс валют в России</div>
    <ul class="exchange__list">
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.USD.CharCode} (${Valute.USD.Name})</div>
        <div class="exchange-item__num">${Valute.USD.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.EUR.CharCode} (${Valute.EUR.Name})</div>
        <div class="exchange-item__num">${Valute.EUR.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.GBP.CharCode} (${Valute.GBP.Name})</div>
        <div class="exchange-item__num">${Valute.GBP.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.CHF.CharCode} (${Valute.CHF.Name})</div>
        <div class="exchange-item__num">${Valute.CHF.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.PLN.CharCode} (${Valute.PLN.Name})</div>
        <div class="exchange-item__num">${Valute.PLN.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.JPY.CharCode} (${Valute.JPY.Name})</div>
        <div class="exchange-item__num">${Valute.JPY.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.UAH.CharCode} (${Valute.UAH.Name})</div>
        <div class="exchange-item__num">${Valute.UAH.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.MDL.CharCode} (${Valute.MDL.Name})</div>
        <div class="exchange-item__num">${Valute.MDL.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.BYN.CharCode} (${Valute.BYN.Name})</div>
        <div class="exchange-item__num">${Valute.BYN.Value}</div>
      </li>
      <li class="exchange-list__item">
        <div class="exchange-item__text">${Valute.KZT.CharCode} (${Valute.KZT.Name})</div>
        <div class="exchange-item__num">${Valute.KZT.Value}</div>
      </li>
    </ul>
    <a class="api__link" href="https://www.cbr-xml-daily.ru/" target="_blank">Курсы валют, API</a>
  </div>`
  }

  static weatherMarkup(data) {
    return `<div class="weather">
    <ul class="weather__header">
      <li class="weather__city">${data.name}</li>
      <li class="weather__preview">
        <div class="weather__icon" data-weather="icon">
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
        </div>
        <div class="weather__temp" data-weather="temp">${Math.round(+data.main.temp - 273)}&deg;</div>
      </li>
      <li class="weather__description" data-weather="description">${data.weather[0].description}</li>
    </ul>
    <ul class="weather__more">
      <li class="weather-more__item">
        <div class="weather-more__text">Ощущается:</div>
        <div class="weather-more__num" data-weather="wind">${Math.round(+data.main.feels_like - 273)}&deg;</div>
      </li>
      <li class="weather-more__item">
        <div class="weather-more__text">Облачность:</div>
        <div class="weather-more__num" data-weather="wind">${data.clouds.all} &#37;</div>
      </li>
      <li class="weather-more__item">
        <div class="weather-more__text">Влажность:</div>
        <div class="weather-more__num" data-weather="humidity">${data.main.humidity} &#37;</div>
      </li>
      <li class="weather-more__item">
        <div class="weather-more__text">Давление:</div>
        <div class="weather-more__num" data-weather="pressure">${data.main.pressure} мм рт. ст.</div>
      </li>
      <li class="weather-more__item">
        <div class="weather-more__text">Скорость ветра:</div>
        <div class="weather-more__num" data-weather="wind">${data.wind.speed} м/с</div>
      </li>
      <li class="weather-more__item">
        <div class="weather-more__text">Видимость:</div>
        <div class="weather-more__num" data-weather="wind">${(data.visibility / 1000).toFixed(1)} км</div>
      </li>
    </ul>
  </div>`
  }

  static appMessagesMarkup(chatName = '', numberUsers = '', numberOnlineUsers = '') {
    return `<div class="app__messages">
    <div class="messages__header column_header">
      <div class="messages-header__info">
        <div class="messages-header__title">${chatName}</div>
        <label>
          <span class="messages-header__text">Всего участников:</span>
          <span class="messages-header__number">${numberUsers}</span>
        </label>
        <label>
          <span class="messages-header__text">Участников онлайн:</span>
          <span class="messages-header__number online">${numberOnlineUsers}</span>
        </label>
      </div>
      <div class="messages-header__buttons">
        <div class="btn-wrap">
          <button class="button find"></button>
        </div>
        <div class="btn-wrap">
          <button class="button menu"></button>
        </div>
      </div>
    </div>
    <ul class="messages__content">

    </ul>
    <div class="messages__footer">
      <div class="footer__controls">
        <div class="footer-controls__emojy-clip">
          <div class="btn-wrap">
            <button class="button inform"></button>
          </div>
          <div class="btn-wrap lock">
            <button class="button mail_lock"></button>
          </div>
          <div class="btn-wrap file-input__wrap">
            <input type="file" class="file__input visually_hidden">
            <button class="button clip"></button>
          </div>
          <div class="btn-wrap">
            <button class="button smile"></button>
          </div>
        </div>
        <div class="footer-controls__input" contenteditable="true" data-placeholder="Введите сообщение"></div>
        <div class="footer-controls__send-btn d_none">
          <div class="btn-wrap">
            <button class="button send"></button>
          </div>
        </div>
        <div class="footer-controls__media">
          <div class="btn-wrap">
            <button class="button micro"></button>
          </div>
          <div class="btn-wrap">
            <button class="button video"></button>
          </div>
          <div class="btn-wrap">
            <button class="button geo"></button>
          </div>
        </div>
        <div class="footer-controls__media record d_none">
           <div class="btn-wrap">
             <button class="button confirm"></button>
           </div>
           <span class="record-timer">00:00</span>
           <div class="btn-wrap">
             <button class="button close"></button>
           </div>
        </div>
      </div>
    </div>
    <video src="" class="messages__preview-record d_none" muted></video>
    <ul class="messages__emoji d_none"></ul>
    <div class="messages__encrypt-form d_none">
      <div class="messages-encrypt-form__body">
        <form action="" class="messages-encrypt-form__form">
          <div class="messages-encrypt-form__text">Придумайте пароль для расшифровки сообщения</div>
          <input type="text" class="messages-encrypt-form__input" placeholder="Введите пароль..." required>
          <button class="messages-encrypt-form__button">Сохранить</button>
        </form>
        <form action="" class="messages-decrypt-form__form d_none">
          <div class="messages-decrypt-form__text">Введите пароль для расшифровки сообщения</div>
          <input type="text" class="messages-decrypt-form__input" placeholder="Введите пароль..." required>
          <button class="messages-decrypt-form__button">Сохранить</button>
        </form>
        <button class="messages-encrypt-form__btn-close"></button>
      </div>
    </div>
    <div class="messages__info d_none">
      <div class="messages-info__body">
        <div class="messages-info__title">Список доступных команд:</div>
        <ul class="messages-info__list">
          <li class="messages-info__item"><span class="info__command">@chaos: погода</span><span class="info__text">запрос погоды</span></li>
          <li class="messages-info__item"><span class="info__command">@chaos: курс</span><span class="info__text">запрос курса валют</span></li>
          <li class="messages-info__item"><span class="info__command">@chaos: фраза</span><span class="info__text">запрос рандомной хакерской фразы</span></li>
          <li class="messages-info__item"><span class="info__command">@chaos: <ДЕНЬ>/<МЕСЯЦ></span><span class="info__text">запрос исторических фактов об этой дате.<br>
            Например: <span class="info__command">@chaos: 30/01</span></span>
          </li>
        </ul>
        <button class="messages-info__button">ЗАКРЫТЬ</button>
      </div>
    </div>
  </div>`;
  }

  static emojiMarkup(emoji) {
    return `<li class="messages-emoji__item">${emoji}</li>`;
  }

  static factsMarkup(data) {
    const container = document.createElement('div');
    container.className = 'historicalFact';
    data.forEach((elem) => {
      container.insertAdjacentHTML('beforeend', `<div>В ${elem.year} году ${elem.text}</div>`)
    });
    return container;
  }

  static messageMarkup(options) {
    return `<li class="message ${options.chaosClassName}" data-id="${options.mesID}">
    <div id="${options.bodyID}" class="message__body">
      <div class="message__header">
        <div class="message__name">${options.chaosUserName}</div>
        <div class="message__date">${options.time}</div>
      </div>
      ${options.filePreview}
      <div class="message__content ${options.lockClassName}">${options.content}</div>
      ${options.button}
    </div>
  </li>`
  }

  static fileMarkup(fileTemplate, fileObj) {
    return `<div class="message__preview-file file-preview">
    <div class="file-preview__body">
      <div class="btn-wrap">
        <a href="${this.baseURL}/${fileObj.name}" download="${fileObj.name}" rel="noopener" class="button download"></a>
      </div>
      <div class="message__file">
        ${fileTemplate}
      </div>
    </div>
  </div>`
  }

  static previewFileMarkup() {
    return `<div class="messages__preview-file preview d_none">
    <div class="preview__body">
      <div class="preview__image"></div>
      <input class="preview__input" type="text" placeholder="Подпись">
      <div class="preview__buttons">
        
        <button class="preview__btn cancel">Отмена</button>
        <button class="preview__btn send">Отправить</button>
      </div>
    </div>
  </div>`
  }

  static get startMarkUp() {
    return `<h1 class="app__title">Chaos Organizer</h1>
    <div class="app__content"></div>`;
  }

  static chatsGroupsItemMarkup(id, chatName, state) {
    return `<li class="general__chat chat ${state}" data-id="${id}">
    <div class="chat__content">
      <div class="chat-content__header">
        <div class="chat-content__title">${chatName}</div>
        <div class="chat-content__time"></div>
      </div>
      <div class="chat-content__preview">
        <span class="preview__checkbox"></span>
        <span class="preview__text"></span>
      </div>
    </div>
  </li>`
  }

  static chatsHeaderMarkup(userName) {
    return `<div class="app__chats">
    <div class="chats__header column_header">
      <div class="chat-header__user">
        <div class="chats-header__avatar"></div>
        <div class="chat-header__name">${userName}</div>
      </div>
      <div class="btn-wrap">
        <button class="button logout"></button>
      </div>
    </div>
    <form class="chats__search search" action="">
      <label class="search__items">
        <button class="search__button_on"></button>
        <button class="search__button_of d_none"></button>
        <input type="text" class="search__input" placeholder="Поиск по чатам">
      </label>
    </form>
    <ul class="chats__group-list"></ul>
    <ul class="chats__list"></ul>
  </div>`
  }

  static chatsUsersListItemMarkup(id, name) {
    return `<li class="chats__chat chat" data-id="${id}">
    <div class="chat__avatar"></div>
    <div class="chat__content">
      <div class="chat-content__header">
        <div class="chat-content__title">${name}</div>
        <div class="chat-content__time"></div>
      </div>
      <div class="chat-content__preview">
        <span class="preview__checkbox"></span>
        <span class="preview__text"></span>
      </div>
    </div>
  </li>`
  }

  static get markupPopup() {
    return `<div class="app__popup d_none">
    <div class="app-popup__body">
      <div class="app-popup__content">
        <div class="app-popup__text">
        </div>
        <button class="app-popup__button">ЗАКРЫТЬ</button>
      </div>
    </div>
  </div>`
  }

  static get markupLoading() {
    return `<div class="app__loading-page d_none">
    <div class="app-loading_page__content"></div>
  </div>`
  }

  static get markupRegister() {
    return `<div class="app__register-page d_none">
    <div class="register-page__body">
      <div class="register-page__avatar-element">
        <label for="avatar" class="register-page__avatar">
          Загрузить аватар
        </label>
        <input id="avatar" type="file" class="register-page__file-element visually_hidden">
      </div>
      <form name="register_form" class="register-page__content">
        <label class="register-page__item">
          <div class="register-page__text">Логин</div>
          <input name="login" class="login-page__input" type="text" required>
        </label>
        <label class="register-page__item">
          <div class="register-page__text">Пароль</div>
          <input name="password" class="login-page__input" type="password" required>
        </label>
        <button class="register-page__button">Зарегистрироваться</button>
      </form>
    </div>
  </div>`
  }

  static get markupLogin() {
    return `<div class="app__login-page">
    <div class="login-page__body">
      <form name="login_form" class="login-page__content">
        <label class="login-page__item">
          <div class="login-page__text">Логин</div>
          <input name="login" class="login-page__input" type="text" required>
        </label>
        <label class="login-page__item">
          <div class="login-page__text">Пароль</div>
          <input name="password" class="login-page__input" type="password" required>
        </label>
        <button class="login-page__button">Войти</button>
      </form>
      <div class="register-page__register">
        <button class="register-page__link">зарегистрироваться</button>
      </div>
    </div>
  </div>`;
  }

  static get sidebarMarkup() {
    return `<div class="app__sidebar search-mes d_none">
    <div class="sidebar__header column_header">
      <div class="btn-wrap">
        <button class="button close-sb"></button>
      </div>
      <div class="sidebar-header__title">Поиск сообщений</div>
    </div>
    <form class="sidebar__search search" action="">
      <label class="search__items">
        <button class="search__button_on" data-id="sidebar_btn-on"></button>
        <button class="search__button_of d_none" data-id="sidebar_btn-of"></button>
        <input data-id="sidebar_search" type="text" class="search__input" placeholder="Поиск...">
      </label>
    </form>
    <ul class="sidebar__found-list"></ul>
  </div>
  
  <div class="app__sidebar info d_none">
    <div class="sidebar__header column_header">
      <div class="btn-wrap">
        <button class="button close-sb"></button>
      </div>
      <div class="sidebar-header__title">Информация о чате</div>
    </div>
    <ul class="sidebar__attachments-list">
      <li class="attachment" data-name="photo">
        <div class="attachment__item">
          <div class="attachment__icon photo"></div>
          <div class="attachment__text">Фото :</div>
        </div>
        <div class="attachment__number" data-number="photo"></div>
      </li>
      <li class="attachment" data-name="video">
        <div class="attachment__item">
          <div class="attachment__icon video"></div>
          <div class="attachment__text">Видео :</div>
        </div>
        <div class="attachment__number" data-number="video"></div>
      </li>
      <li class="attachment" data-name="file">
        <div class="attachment__item">
          <span class="attachment__icon file"></span>
          <span class="attachment__text">Файлов :</span>
        </div>
        <div class="attachment__number" data-number="file"></div>
      </li>
      <li class="attachment" data-name="audio">
        <div class="attachment__item">
          <span class="attachment__icon audio"></span>
          <span class="attachment__text">Аудиофайлов :</span>
        </div>
        <div class="attachment__number" data-number="audio"></div>
      </li>
      <li class="attachment" data-name="link">
        <div class="attachment__item">
          <span class="attachment__icon link"></span>
          <span class="attachment__text">Ссылок :</span>
        </div>
        <div class="attachment__number" data-number="link"></div>
      </li>
      <li class="attachment" data-name="voice">
        <div class="attachment__item">
          <span class="attachment__icon voice"></span>
          <span class="attachment__text">Голосовых сообщений :</span>
        </div>
        <div class="attachment__number" data-number="voice"></div>
      </li>
      <li class="attachment" data-name="gif">
        <div class="attachment__item">
          <span class="attachment__icon gif"></span>
          <span class="attachment__text">GIF :</span>
        </div>
        <div class="attachment__number" data-number="gif"></div>
      </li>
    </ul>
    <div class="sidebar__preview d_none" data-name="preview-menu">
      <div class="sidebar-preview__header">
        <div class="btn-wrap">
          <button class="button back"></button>
        </div>
        <div class="sidebar-preview__title"></div>
      </div>
      <ul class="sidebar-preview__photo visually_hidden" data-id="photo"></ul>
      <ul class="sidebar-preview__video visually_hidden" data-id="video"></ul>
      <ul class="sidebar-preview__voice visually_hidden" data-id="voice"></ul>
      <ul class="sidebar-preview__audio visually_hidden" data-id="audio"></ul>
      <ul class="sidebar-preview__link visually_hidden" data-id="link"></ul>
    </div>
  </div>`
  }

  static previewPhotoMarkup(image, baseURL) {
    return `<li class="photo__item"><a href="${baseURL}/${image}" target="_blank">
    <img src="${baseURL}/${image}">
  </a></li>`
  }

  static previewVideoMarkup(fileName, baseURL) {
    return `<li class="video__item"><a href="${baseURL}/${fileName}" target="_blank">
    <video src="${baseURL}/${fileName}" controls></video>
  </a></li>`
  }

  static previewAudioMarkup(fileName, baseURL) {
    return `<li class="voice__item"><audio src="${baseURL}/${fileName}" controls></audio>
      <div class="btn-wrap">
        <a class="button download" href="${baseURL}/${fileName}" download="${fileName}" rel="noopener"></a>
      </div>
    </li> `
  }

  static previewLinkMarkup(elem) {
    return `<li class="link__item">
    <div class="link-item__img"></div>
    <div class="link-item__content">
      <div class="link-item__data">${elem.time}</div>
      <div class="link-item__link">${Utils.getLink(elem.message)}</div>
    </div>
  </li>`
  }
}