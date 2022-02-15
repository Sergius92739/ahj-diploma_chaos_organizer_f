/* eslint-disable import/no-cycle */
/* eslint-disable no-console */
import CryptoJS from 'crypto-js';
import Geolocation from "./Geolocation";
import Sidebar from "./Sidebar";
import Timer from "./Timer";

export default class MainPage {
  constructor(element, baseURL) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('element is not HTMLElement');
    }
    this.container = element;
    this.baseURL = baseURL;
    this.ws = null;
    this.wsURL = 'ws://ahj-chaos-organizer-sergius.herokuapp.com'
    this.appContent = null;
    this.userID = null;
    this.groupList = null;
    this.chatsList = null;
    this.messagesContent = null;
    this.activeChatID = null;
    this.sendBtnBox = null;
    this.mediaBtnsBox = null;
    this.mainInput = null;
    this.mainInputObserver = null;
    this.numberOfUsers = null;
    this.numberOfOnlineUsers = null;
    this.wrapFileInput = null;
    this.fileInput = null;
    this.dropTooltip = null;
    this.previewURL = null;
    this.file = null;
    this.currentChunk = 0;
    this.fetching = false;
    this.totalMessages = null;
    this.stream = null;
    this.chunks = null;
    this.recorder = null;
    this.timer = null;
    this.contentType = null;
    this.cancellation = false;
    this.sidebar = null;
    this.geolocation = new Geolocation();
    this.encryption = false;
    this.decryption = false;
    this.encryptPassword = null;
    this.decryptPassword = null;
    this.weatherKey = 'eca3c39a199c6467336e7a5e2a1db49e';

    this.onWsMessage = this.onWsMessage.bind(this);
    this.onSendBtnClick = this.onSendBtnClick.bind(this);
    this.onMaininputKeydown = this.onMaininputKeydown.bind(this);
    this.onWrapFileInputClick = this.onWrapFileInputClick.bind(this);
    this.onFileIputChange = this.onFileIputChange.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onPreviewCancelBtnClick = this.onPreviewCancelBtnClick.bind(this);
    this.onPreviewSendBtnClick = this.onPreviewSendBtnClick.bind(this);
    this.onAppMessagesDragover = this.onAppMessagesDragover.bind(this);
    this.onAppMessagesDragleave = this.onAppMessagesDragleave.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onMediaBtnsClick = this.onMediaBtnsClick.bind(this);
    this.onMediaRecordClick = this.onMediaRecordClick.bind(this);
    this.startRecord = this.startRecord.bind(this);
    this.dataavailable = this.dataavailable.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.onEmojiBtnClick = this.onEmojiBtnClick.bind(this);
    this.onEmojiListClick = this.onEmojiListClick.bind(this);
    this.onEncryptionBtnClick = this.onEncryptionBtnClick.bind(this);
    this.onEncryptFormSubmit = this.onEncryptFormSubmit.bind(this);
    this.onMesFormBtnCloseClick = this.onMesFormBtnCloseClick.bind(this);
    this.onMessagesContentClick = this.onMessagesContentClick.bind(this);
    this.onDecryptFormSubmit = this.onDecryptFormSubmit.bind(this);
  }

 async init(data) {
    this.userID = data.user.id;
    this.container.insertAdjacentHTML('afterbegin', MainPage.startMarkUp);
    this.appContent = this.container.querySelector('.app__content');
    this.appContent.insertAdjacentHTML('beforeend', MainPage.chatsHeaderMarkup(data.user.login));
    this.appContent.insertAdjacentHTML('beforeend', MainPage.appMessagesMarkup());
    this.appMessages = this.container.querySelector('.app__messages');
    this.appMessages.insertAdjacentHTML('beforeend', MainPage.previewFileMarkup());
    this.previewFile = this.container.querySelector('.messages__preview-file.preview');
    this.previewImage = this.previewFile.querySelector('.preview__image');
    this.previewInput = this.previewFile.querySelector('.preview__input');
    this.previewCancelBtn = this.previewFile.querySelector('.preview__btn.cancel');
    this.previewSendBtn = this.previewFile.querySelector('.preview__btn.send');
    this.sendBtnBox = this.container.querySelector('.footer-controls__send-btn');
    this.mediaBtnsBox = this.container.querySelector('.footer-controls__media');
    this.mediaRecordBox = this.container.querySelector('.footer-controls__media.record')
    this.mainInput = this.container.querySelector('.footer-controls__input');
    this.activateInputObserver();
    this.messagesHeaderTitle = this.container.querySelector('.messages-header__title');
    this.numberOfUsers = this.container.querySelector('.messages-header__number');
    this.numberOfOnlineUsers = this.container.querySelector('.messages-header__number.online');
    this.messagesContent = this.container.querySelector('.messages__content');
    this.userAvatar = this.container.querySelector('.chats-header__avatar');
    this.drawAvatar(data);
    this.groupList = this.container.querySelector('.chats__group-list');
    this.redrawDialogues(data);
    this.chatsList = this.container.querySelector('.chats__list');
    this.redrawUsers(data.users);
    this.btnLogout = this.container.querySelector('.button.logout');
    this.wrapFileInput = this.container.querySelector('.file-input__wrap');
    this.fileInput = this.container.querySelector('.file__input');
    this.dropTooltip = this.container.querySelector('.dropTooltip');
    this.messagesFooter = this.container.querySelector('.messages__footer');
    this.popup = this.container.querySelector('.app__popup');
    this.popupContent = this.popup.querySelector('.app-popup__text');
    this.timer = new Timer(document.querySelector('.record-timer'));
    this.previewRecord = this.container.querySelector('.messages__preview-record');
    this.emojiList = this.container.querySelector('.messages__emoji');
    this.emojiBtn = this.container.querySelector('.button.smile').closest('.btn-wrap');
    this.encryptionBtn = this.container.querySelector('.button.mail_lock').closest('.btn-wrap');
    this.encryptPopup = this.container.querySelector('.messages__encrypt-form');
    this.mesEncryptForm = this.container.querySelector('.messages-encrypt-form__form');
    this.mesDecryptForm = this.container.querySelector('.messages-decrypt-form__form');
    this.mesEncryptFormText = this.container.querySelector('.messages-encrypt-form__text')
    this.mesDecryptFormText = this.container.querySelector('.messages-decrypt-form__text')
    this.mesEncryptFormInput = this.container.querySelector('.messages-encrypt-form__input');
    this.mesDecryptFormInput = this.container.querySelector('.messages-decrypt-form__input');
    this.mesFormButtonClose = this.container.querySelector('.messages-encrypt-form__btn-close');
    this.infoBtn = this.container.querySelector('.button.inform').closest('.btn-wrap');
    this.infoTooltip = this.container.querySelector('.messages__info');
    this.infoTooltipBtn = this.container.querySelector('.messages-info__button')

    this.asignEventHandlers();
    this.onSocketConnect();
  }

  asignEventHandlers() {
    this.sendBtnBox.addEventListener('click', this.onSendBtnClick);
    this.mainInput.addEventListener('keydown', this.onMaininputKeydown);
    this.wrapFileInput.addEventListener('click', this.onWrapFileInputClick);
    this.fileInput.addEventListener('change', this.onFileIputChange);
    this.messagesContent.addEventListener('drop', this.onDrop);
    this.messagesContent.addEventListener('dragover', this.onAppMessagesDragover);
    this.messagesContent.addEventListener('dragleave', this.onAppMessagesDragleave);
    this.previewCancelBtn.addEventListener('click', this.onPreviewCancelBtnClick);
    this.previewSendBtn.addEventListener('click', this.onPreviewSendBtnClick);
    this.messagesContent.addEventListener('scroll', this.onScroll);
    this.mediaBtnsBox.addEventListener('click', this.onMediaBtnsClick);
    this.mediaRecordBox.addEventListener('click', this.onMediaRecordClick);
    this.emojiBtn.addEventListener('click', this.onEmojiBtnClick);
    this.emojiList.addEventListener('click', this.onEmojiListClick);
    this.encryptionBtn.addEventListener('click', this.onEncryptionBtnClick);
    this.mesEncryptForm.addEventListener('submit', this.onEncryptFormSubmit);
    this.mesDecryptForm.addEventListener('submit', this.onDecryptFormSubmit);
    this.mesFormButtonClose.addEventListener('click', this.onMesFormBtnCloseClick);
    this.messagesContent.addEventListener('click', this.onMessagesContentClick);
    this.infoBtn.addEventListener('click', () => this.infoTooltip.classList.remove('d_none'))
    this.infoTooltipBtn.addEventListener('click', () => this.infoTooltip.classList.add('d_none'))
  }

  showEncryptForm() {
    this.mesEncryptForm.className = 'messages-encrypt-form__form';
    this.mesDecryptForm.className = 'messages-decrypt-form__form d_none';
    this.encryptPopup.classList.remove('d_none');
  }

  showDecryptForm() {
    this.mesEncryptForm.className = 'messages-encrypt-form__form d_none';
    this.mesDecryptForm.className = 'messages-decrypt-form__form';
    this.encryptPopup.classList.remove('d_none');
  }

  hideEncryptPopup() {
    this.encryptPopup.classList.add('d_none');
  }

  encryptMessage(word, key) {
    this.text = word;
    const encJson = CryptoJS.AES.encrypt(JSON.stringify(this.text), key).toString()
    const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson))
    return encData
  }

  decryptMessage(word, key) {
    this.word = word;
    const decData = CryptoJS.enc.Base64.parse(this.word).toString(CryptoJS.enc.Utf8)
    const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8)
    return JSON.parse(bytes)
  }

  async onMessagesContentClick(evt) {
    if (evt.target.closest('.btn-wrap.lock')) {
      this.targetMesEl = evt.target.closest('.btn-wrap.lock');
      if (this.targetMesEl.classList.contains('checked')) {
        this.showDecryptForm();
      } else {
        this.targetMesEl.classList.add('checked');
        let contentEl;
        const text = this.targetMesEl.closest('.message__body').querySelector('.message__content');
        if (this.targetMesEl.closest('.message__body').querySelector('.encryptedFile')) {
          contentEl = this.targetMesEl.closest('.message__body').querySelector('.encryptedFile__content');
        } else {
          contentEl = this.targetMesEl.closest('.message__body').querySelector('.message__content');
        }

        const { id } = this.targetMesEl.closest('.message').dataset;
        const formData = new FormData();
        formData.append('mesID', id);
        formData.append('dialog', this.checkDialog());
        formData.append('dialogID', this.activeChatID)
        const request = await fetch(`${this.baseURL}/decryption`, {
          method: 'POST',
          body: formData,
        })
        const result = await request.json();
        const originalText = this.encryptMessage(contentEl.innerHTML, result.data);
        contentEl.textContent = originalText;
        if (text.textContent) {
          const textInfo = this.encryptMessage(text.textContent, result.data);
          text.textContent = textInfo;
        }
      }
    }
  }

  onMesFormBtnCloseClick() {
    this.hideEncryptPopup();
    this.encryptionBtn.classList.remove('checked')
    this.encryption = false;
  }

  onEncryptFormSubmit(evt) {
    evt.preventDefault();
    this.encryptPassword = this.mesEncryptFormInput.value;
    this.hideEncryptPopup();
    this.mesEncryptFormInput.value = '';
  }

  async onDecryptFormSubmit(evt) {
    evt.preventDefault();
    this.hideEncryptPopup();
    const { id } = this.targetMesEl.closest('.message').dataset;
    const formData = new FormData();
    formData.append('mesID', id);
    formData.append('dialog', this.checkDialog());
    formData.append('dialogID', this.activeChatID)
    const request = await fetch(`${this.baseURL}/decryption`, {
      method: 'POST',
      body: formData,
    });
    const result = await request.json();
    if (result.success) {
      if (result.data === this.mesDecryptFormInput.value) {
        this.encryptPassword = result.data;
        this.targetMesEl.classList.remove('checked');
        let contentEl;
        const text = this.targetMesEl.closest('.message__body').querySelector('.message__content');
        if (this.targetMesEl.closest('.message__body').querySelector('.encryptedFile')) {
          contentEl = await this.targetMesEl.closest('.message__body').querySelector('.encryptedFile__content')
        } else {
          contentEl = await this.targetMesEl.closest('.message__body').querySelector('.message__content')
        }
        this.mesDecryptFormInput.value = '';
        const originalText = await this.decryptMessage(contentEl.textContent, result.data);
        contentEl.innerHTML = originalText;
        if (text.textContent) {
          const textInfo = await this.decryptMessage(text.textContent, result.data)
          text.textContent = textInfo;
        }
      } else {
        this.showPopup('Неверный пароль!')
        this.mesDecryptFormInput.value = '';
      }
    }
  }

  onEncryptionBtnClick() {
    if (!this.encryption) {
      this.encryptionBtn.classList.add('checked');
      this.encryption = true;
      this.showEncryptForm();
    } else {
      this.encryptionBtn.classList.remove('checked');
      this.encryption = false;
      this.encryptPassword = null;
    }
  }

  onEmojiListClick(evt) {
    if (evt.target.className === 'messages-emoji__item') {
      const emoji = evt.target.textContent;
      this.mainInput.innerHTML += emoji;
    }
  }

  async onEmojiBtnClick() {
    if (this.emojiList.innerHTML === '') {
      const request = await fetch(`${this.baseURL}/emoji`);
      this.emojiResult = await request.json();
    }

    if (this.emojiResult.success) {
      this.drawEmoji(this.emojiResult.data);
      this.emojiList.classList.toggle('d_none');
      this.messagesContent.classList.toggle('emoji');
      this.scrollToBottom();
    }
  }

  drawEmoji(data) {
    this.emojiList.innerHTML = '';
    data.forEach((emoji) => {
      this.emojiList.insertAdjacentHTML('beforeend', MainPage.emojiMarkup(emoji));
    })
  }

  onMediaRecordClick(evt) {
    if (evt.target.closest('.btn-wrap').querySelector('.button.close')) {
      this.cancellation = true;
      this.mediaRecordBox.classList.add('d_none');
      this.mediaBtnsBox.classList.remove('d_none');
      this.recorder.stop();
      this.stream.getTracks().forEach((track) => track.stop());
      this.timer.resetTimer();
      if (this.contentType === 'video') {
        this.previewRecord.classList.add('d_none');
      }
    }
    if (evt.target.closest('.btn-wrap').querySelector('.button.confirm')) {
      this.recorder.stop();
      this.stream.getTracks().forEach((track) => track.stop());
      if (this.contentType === 'video') {
        this.previewRecord.classList.add('d_none');
      }
    }
  }

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

  async getWeather() {
    const location = await this.geolocation.getLocation(this.showPopup);
    const request = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&lang=ru&appid=${this.weatherKey}`);
    const response = await request.json();
    return response;
  }

  // eslint-disable-next-line class-methods-use-this
  async getExchangeRates() {
    const request = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
    const response = await request.json();
    return response;
  }

  // eslint-disable-next-line class-methods-use-this
  async getFactsNumber(object) {
    const request = await fetch(`http://numbersapi.com/${object.month}/${object.day}/date?json`);
    const response = await request.json()
    return response;
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

  async onMediaBtnsClick(evt) {
    if (!navigator.mediaDevices) {
      this.showPopup('Ваш браузер не поддерживает API MediaDevices');
      return;
    }

    try {
      if (this.cancellation) {
        this.cancellation = false;
      }

      if (evt.target.closest('.btn-wrap').querySelector('.button.micro')) {
        this.contentType = 'audio';
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      if (evt.target.closest('.btn-wrap').querySelector('.button.video')) {
        this.contentType = 'video';
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        this.previewRecord.classList.remove('d_none')
        this.previewRecord.srcObject = this.stream;
        this.previewRecord.play();
      }

      if (evt.target.closest('.btn-wrap').querySelector('.button.geo')) {
        const promise = this.geolocation.getLocation(this.showPopup)
        promise.then((data) => {
          if (data) {
            const msg = {
              type: 'text_message',
              data: {
                user: this.userID,
                dialog: this.checkDialog(),
                dialogID: this.activeChatID,
                message: data,
              },
            }
            this.ws.send(JSON.stringify(msg));
          }
        })
        return;
      }

      if (!window.MediaRecorder) {
        this.showPopup('Ваш браузер не поддерживает API MediaRecorder');
        return;
      }

      this.recorder = new MediaRecorder(this.stream);
      this.chunks = [];

      this.recorder.addEventListener('start', this.startRecord);
      this.recorder.addEventListener('dataavailable', this.dataavailable);
      this.recorder.addEventListener('stop', this.stopRecord);

      this.recorder.start();

    } catch (err) {
      this.showPopup('Настройки вашего браузера запрещают доступ к микрофону или видеокамере');
      console.error(err);
    }
  }

  startRecord() {
    this.mediaBtnsBox.classList.add('d_none');
    this.mediaRecordBox.classList.remove('d_none');
    this.timer.startTimer();
  }

  dataavailable(evt) {
    if (!this.cancellation) {
      this.chunks.push(evt.data);
    }
  }

  stopRecord() {
    const type = this.recorder.mimeType;
    if (!this.cancellation) {
      this.file = new File(this.chunks, '', { type });
      this.mediaRecordBox.classList.add('d_none');
      this.mediaBtnsBox.classList.remove('d_none');
      this.timer.resetTimer();
      this.sendFile();
    }
  }

  async onScroll(evt) {
    [this.firstChild] = evt.target.children;
    this.firstChildCoords = evt.target.children[0].getBoundingClientRect();
    const targetCoords = this.messagesContent.getBoundingClientRect().top;
    const { paddingTop } = window.getComputedStyle(this.messagesContent);
    if (this.firstChildCoords.top - parseInt(paddingTop, 10) === targetCoords
      && document.querySelectorAll('.message').length < this.totalMessages) {
      this.fetching = true;
      this.currentChunk += 1;
      if (this.fetching) {
        const data = {
          type: 'more_messages',
          data: {
            currentChunk: this.currentChunk,
            dialog: this.checkDialog(),
            dialogID: this.activeChatID,
          }
        }
        this.ws.send(JSON.stringify(data));
      }
    }
  }

  scrollToLastMessage() {
    if (this.firstChild) {
      this.firstChild.scrollIntoView(true);
    }
  }

  scrollToBottom() {
    this.messagesContent.scrollTop = this.messagesContent.scrollHeight;
  }

  showPopup(text) {
    this.popup.classList.remove('d_none');
    this.popupContent.textContent = text;
  }

  onAppMessagesDragleave() {
    this.hideTooltip();
  }

  onAppMessagesDragover(evt) {
    evt.preventDefault()
    this.showTooltip();
  }

  async onPreviewSendBtnClick() {
    this.previewImage.innerHTML = '<div class="preview__loading"></div>';
    let description = '';
    if (this.previewInput.value) {
      description = this.previewInput.value;
      this.previewInput.value = '';
    }
    this.sendFile(description);
  }

  async sendFile(description = '') {
    const formData = new FormData();
    const dataEncrypt = {
      encrypt: this.encryption
    }
    formData.append('user', this.userID);
    formData.append('dialog', this.checkDialog());
    formData.append('dialogID', this.activeChatID);
    formData.append('file', this.file);
    formData.append('description', description);
    formData.append('encryption', JSON.stringify(dataEncrypt));
    formData.append('password', this.encryptPassword)
    const request = await fetch(`${this.baseURL}/files`, {
      method: 'POST',
      body: formData,
    });

    const result = await request.json();
    if (result.success) {
      this.currentChunk = 0;
      const data = {
        type: 'messages',
        data: {
          dialog: this.checkDialog(),
          dialogID: this.activeChatID,
        }
      }
      this.ws.send(JSON.stringify(data));
      this.hidePreviewFile();
      this.encryption = false;
      this.encryptPassword = null;
      this.encryptionBtn.classList.remove('checked');
    }
  }

  onPreviewCancelBtnClick() {
    this.hideTooltip();
    this.hidePreviewFile();
    URL.revokeObjectURL(this.previewURL);
  }

  async onDrop(evt) {
    evt.preventDefault();
    this.file = await [...evt.dataTransfer.files][0];
    this.previewURL = URL.createObjectURL(this.file);
    this.adaptationPreview(this.file);
  }

  async onFileIputChange(evt) {
    evt.preventDefault();
    this.file = await [...evt.currentTarget.files][0];
    if (this.file) {
      this.previewURL = URL.createObjectURL(this.file);
      this.adaptationPreview(this.file);
    }
  }

  adaptationPreview(file) {
    if (file.size > 134217728) {
      this.showPopup('Размер файла превышает лимит 128Мб');
      this.hideTooltip();
      return;
    }
    if (file.type.startsWith('image')) {
      this.previewImage.style.backgroundImage = `url('${this.previewURL}')`;
    }
    if (file.type.startsWith('audio')) {
      this.previewImage.innerHTML = `<audio src="${this.previewURL}" controls></audio>`;
    }
    if (file.type.startsWith('video')) {
      this.previewImage.innerHTML = `<video src="${this.previewURL}" height="300px" width="450px" controls></video>`;
    }
    if (file.type === 'application/pdf') {
      this.previewImage.innerHTML = `<object height="300px" width="450px" data="${this.previewURL}" type="application/pdf"></object>`;
    }
    if (file.type === 'text/plain') {
      this.previewImage.innerHTML = `<object height="300px" width="450px" data="${this.previewURL}" type="text/plain"></object>`;
    }
    this.showPreviewFile();
    this.hideTooltip();
  }

  showPreviewFile() {
    this.previewFile.classList.remove('d_none');
  }

  hidePreviewFile() {
    this.previewFile.classList.add('d_none');
    this.previewImage.style.backgroundImage = `none`;
    this.previewImage.innerHTML = '';
  }

  showTooltip() {
    this.messagesContent.className = 'messages__content tooltip';
  }

  hideTooltip() {
    this.messagesContent.className = 'messages__content'
  }

  onWrapFileInputClick(evt) {
    if (evt.target.closest('.btn-wrap.file-input__wrap')) {
      const event = new MouseEvent('click');
      this.fileInput.dispatchEvent(event);

    }
  }

 async onMaininputKeydown(evt) {
    if (evt.code === 'Enter') {
      evt.preventDefault();
      let content;
      let encryption;
      if (this.encryption) {
        content = this.encryptMessage(this.mainInput.textContent, this.encryptPassword)
        encryption = true;
      } else {
        content = this.mainInput.textContent;
        encryption = false;
      }
      if (this.mainInput.textContent.trim() === '@chaos: погода') {
        const weather = await this.getWeather();
        content = weather;
      }
      if (this.mainInput.textContent.trim() === '@chaos: курс') {
        const rates = await this.getExchangeRates();
        content = rates;
      }
      if (/^@chaos:\s(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])$/.test(this.mainInput.textContent.trim())) {
        const date = this.mainInput.textContent.trim().split(' ')[1];
        const object = {
          month: date.split('/')[1],
          day: date.split('/')[0],
        }
        const facts = await this.getFactsNumber(object);
        content = facts;
      }
      const data = {
        type: 'text_message',
        data: {
          encryption,
          password: this.encryptPassword,
          user: this.userID,
          dialog: this.checkDialog(),
          dialogID: this.activeChatID,
          message: content,
        },
      }
      this.ws.send(JSON.stringify(data));
      this.mainInput.innerText = '';
      this.emojiList.classList.add('d_none');
      this.messagesContent.classList.remove('emoji');
      this.encryption = false;
      this.encryptPassword = null;
      this.encryptionBtn.classList.remove('checked');
    }
  }

  async onSendBtnClick(evt) {
    if (evt.target.closest('.btn-wrap')) {
      let content;
      let encryption;
      
      if (this.encryption) {
        content = this.encryptMessage(this.mainInput.textContent, this.encryptPassword)
        encryption = true;
      } else {
        content = this.mainInput.textContent;
        encryption = false;
      }
      if (this.mainInput.textContent.trim() === '@chaos: погода') {
        const weather = await this.getWeather();
        content = weather;
      }
      if (this.mainInput.textContent.trim() === '@chaos: курс') {
        const rates = await this.getExchangeRates();
        content = rates;
      }
      if (/^@chaos:\s(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])$/.test(this.mainInput.textContent.trim())) {
        const date = this.mainInput.textContent.trim().split(' ')[1];
        const object = {
          month: date.split('/')[1],
          day: date.split('/')[0],
        }
        const facts = await this.getFactsNumber(object);
        content = facts;
      }
      const data = {
        type: 'text_message',
        data: {
          encryption,
          password: this.encryptPassword,
          user: this.userID,
          dialog: this.checkDialog(),
          dialogID: this.activeChatID,
          message: content,
        },
      }
      this.ws.send(JSON.stringify(data));
      this.mainInput.innerText = '';
      this.emojiList.classList.add('d_none');
      this.messagesContent.classList.remove('emoji');
      this.encryption = false;
      this.encryptPassword = null;
      this.encryptionBtn.classList.remove('checked');
    }
  }

  checkDialog() {
    let dialog;
    if (this.groupList.querySelector('.chat.active')) {
      dialog = 'group'
    } else {
      dialog = 'personal'
    }
    return dialog;
  }

  activateInputObserver() {
    this.mainInputObserver = new MutationObserver(() => {
      this.sendBtnBox.className = 'footer-controls__send-btn'
      this.mediaBtnsBox.className = 'footer-controls__media d_none'
      if (this.mainInput.innerText === '') {
        this.sendBtnBox.className = 'footer-controls__send-btn d_none'
        this.mediaBtnsBox.className = 'footer-controls__media'
      }
    });

    this.mainInputObserver.observe(this.mainInput, {
      childList: true,
      characterData: true,
      subtree: true,
    })
  }

  wsInterval() {
    const data = JSON.stringify({
      type: 'interval'
    });
    setInterval(() => {
      this.ws.send(data);
    }, 5000)
  }

  onSocketConnect() {
    this.ws = new WebSocket(this.wsURL);
    this.ws.binaryType = 'blob';
    this.ws.addEventListener('open', () => {
      const data = JSON.stringify({
        type: 'ping',
        data: {
          currentChunk: this.currentChunk,
          user: this.userID,
          dialog: this.checkDialog(),
          dialogID: this.activeChatID,
        }
      });
      this.ws.send(data);
      console.log('connection is open')
      this.sidebar = new Sidebar(this.container, {
        ws: this.ws,
        user: this.userID,
        dialogID: this.activeChatID,
      });
      this.sidebar.init();
      this.wsInterval();
    });
    this.ws.addEventListener('message', this.onWsMessage);
    this.ws.addEventListener('close', () => {
      console.log('conection closed');
    });
    this.ws.addEventListener('error', (err) => {
      console.error(err);
    })
  }

  onWsMessage(evt) {
    const message = JSON.parse(evt.data);
    if (message.type === 'pong') {
      if (message.users.length > 1) {
        const { users } = message;
        this.redrawUsers(users);
      }
      this.drawMessages(message);
      this.scrollToBottom();
      this.totalMessages = message.totalMessages;
      return false;
    }
    if (message.type === 'text_message') {
      const { data } = message;
      this.messagesContent.innerHTML = '';
      this.drawMessages(data);
      this.scrollToBottom();
      this.currentChunk = 0;
      this.fetching = false;
      this.totalMessages = data.totalMessages;
      return false;
    }
    if (message.type === 'logout') {
      const { users } = message;
      this.redrawUsers(users);
      return false;
    }
    if (message.type === 'more_messages') {
      const { data } = message;
      this.drawMessages(data);
      this.scrollToLastMessage();
      this.fetching = false;
      this.totalMessages = data.totalMessages;
      return false;
    }
    if (message.type === 'interval') {
      return false;
    }
    return false;
  }

  drawMessages(data) {
    this.messagesHeaderTitle.textContent = data.chatName;
    if (data.messages) {
      data.messages.reverse().forEach((message) => {
        let className;
        if (message.userID === this.userID) {
          className = 'right';
        } else {
          className = 'left';
        }
        this.messagesContent.insertAdjacentHTML('afterbegin', this.messageMarkup(
          className,
          message.message,
          message.time,
          message.userName,
          message.mesID,
          message.file,
          message.encryption,
          message.password,
        ));
      });
    }
  }

  redrawUsers(users) {
    this.chatsList.innerHTML = '';
    users.forEach((user) => {
      if (user.id !== this.userID) {
        this.chatsList.insertAdjacentHTML('beforeend', MainPage.chatsUsersListItemMarkup(
          user.id,
          user.login,
        ));
        const avatar = this.chatsList.lastElementChild.querySelector('.chat__avatar');
        if (user.avatar) {
          avatar.style.backgroundImage = `url('${this.baseURL}/${user.avatar}')`;
        } else {
          avatar.style.backgroundImage = `url('${this.baseURL}/avatar.png')`;
        }
        if (user.online) {
          avatar.className = 'chat__avatar online';
        } else {
          avatar.className = 'chat__avatar';
        }
      }
    });
    this.numberOfUsers.textContent = users.length;
    this.numberOfOnlineUsers.textContent = this.container.querySelectorAll('.chat__avatar.online').length + 1;
  }

  drawAvatar(data) {
    if (data.user.avatar) {
      this.userAvatar.style.backgroundImage = `url('${this.baseURL}/${data.user.avatar}')`;
    } else {
      this.userAvatar.style.backgroundImage = `url('${this.baseURL}/avatar.png')`;
    }
  }

  redrawDialogues(data) {
    let state = '';
    data.groups.forEach((group) => {
      if (group.active) {
        state = 'active';
        this.messagesHeaderTitle.textContent = group.name;
        this.numberOfUsers.textContent = data.users.length;
        this.activeChatID = group.id;
      }
      this.groupList.insertAdjacentHTML('beforeend', MainPage.chatsGroupsItemMarkup(
        group.id,
        group.name,
        state,
      ));
    })
  }

  static checkLink(value) {
    return value.match(/https?:\/\/[^\s]+/gm) !== null;
  }

  static getLink(value) {
    return value.replace(/https?:\/\/[^\s]+/gm, (link) => `<a href='${link}' target='_blank'>${link}</a>`);
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
          <li class="messages-info__item"><span class="info__command">@chaos: <ДЕНЬ>/<МЕСЯЦ></span><span class="info__text">запрос исторического факта об этой дате.<br>
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

  messageMarkup(className, message, time, userName, mesID, fileObj = '', encryption, password) {
    let lockClassName;
    let button;
    let filePreview;
    let fileTemplate;
    let chaosClassName = className;
    let chaosUserName = userName;
    let bodyID = '';

    if (encryption) {
      lockClassName = 'lock';
      button = `<div class="btn-wrap lock checked"">
      <button class="button mail_lock"></button>
    </div>`;
    } else {
      lockClassName = '';
      button = '';
    }
    let content = message;
    if (typeof message !== 'object' && MainPage.checkLink(message)) {
      content = MainPage.getLink(message);
    }

    if (typeof message === 'object') {
      if (message.latitude && message.longitude) {
        content = `<span class="coords">Координаты: [${message.latitude}, ${message.longitude}]</span><a class="coords-btn" href="http://www.google.com/maps/place/${message.latitude},${message.longitude}" target="_blank"></a>`
      }
      if (message.weather) {
        chaosClassName = 'left';
        chaosUserName = 'chaos';
        content = MainPage.weatherMarkup(message);
      }
      if (message.Valute) {
        chaosClassName = 'left';
        chaosUserName = 'chaos';
        content = MainPage.exchangeMarkup(message);
        bodyID = 'chaos';
      }
      if (message.text && message.year && message.type === 'date') {
        chaosClassName = 'left';
        chaosUserName = 'chaos';
        content = message.text;
      }
    }

    if (fileObj) {
      if (fileObj && !encryption) {
        if (fileObj.type.startsWith('audio') && fileObj.type !== 'audio/webm;codecs=opus') {
          fileTemplate = `<audio src="${this.baseURL}/${fileObj.name}" controls></audio>`
        }
        if (fileObj.type === 'audio/webm;codecs=opus') {
          fileTemplate = `<div class="voice">Голосовое сообщение:</div><audio src="${this.baseURL}/${fileObj.name}" controls></audio>`
        }
        if (fileObj.type.startsWith('video')) {
          fileTemplate = `<video src="${this.baseURL}/${fileObj.name}" width="350" height="200" controls></video>`
        }
        if (fileObj.type.startsWith('text')) {
          fileTemplate = `<object data="${this.baseURL}/${fileObj.name}" width="350" height="450" type="text/plain"></object>`
        }
        if (fileObj.type.startsWith('application')) {
          fileTemplate = `<object data="${this.baseURL}/${fileObj.name}" width="350" height="450"></object>`
        }
        if (fileObj.type.startsWith('image')) {
          fileTemplate = `<img src="${this.baseURL}/${fileObj.name}">`
        }
        filePreview = MainPage.fileMarkup(fileTemplate, fileObj)
      }
      if (fileObj && encryption) {
        if (message) {
          content = this.encryptMessage(message, password);
        }
        if (fileObj.type.startsWith('audio') && fileObj.type !== 'audio/webm;codecs=opus') {
          fileTemplate = `<audio src="${this.baseURL}/${fileObj.name}" controls></audio>`
        }
        if (fileObj.type === 'audio/webm;codecs=opus') {
          fileTemplate = `<div class="voice">Голосовое сообщение:</div><audio src="${this.baseURL}/${fileObj.name}" controls></audio>`
        }
        if (fileObj.type.startsWith('video')) {
          fileTemplate = `<video src="${this.baseURL}/${fileObj.name}" width="350" height="200" controls></video>`
        }
        if (fileObj.type.startsWith('text')) {
          fileTemplate = `<object data="${this.baseURL}/${fileObj.name}" width="350" height="450" type="text/plain"></object>`
        }
        if (fileObj.type.startsWith('application')) {
          fileTemplate = `<object data="${this.baseURL}/${fileObj.name}" width="350" height="450"></object>`
        }
        if (fileObj.type.startsWith('image')) {
          fileTemplate = `<img src="${this.baseURL}/${fileObj.name}">`
        }
        filePreview = `<div class="encryptedFile"><span class="ecryptedTitle">Зашифрованный файл:</span><span class="encryptedFile__content">${this.encryptMessage(MainPage.fileMarkup(fileTemplate, fileObj), password)}</span></div>`
      }
    } else {
      fileTemplate = '';
      filePreview = '';
    }

    return `<li class="message ${chaosClassName}" data-id="${mesID}">
    <div id="${bodyID}" class="message__body">
      <div class="message__header">
        <div class="message__name">${chaosUserName}</div>
        <div class="message__date">${time}</div>
      </div>
      ${filePreview}
      <div class="message__content ${lockClassName}">${content}</div>
      ${button}
    </div>
  </li>`;
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
}