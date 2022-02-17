/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable no-console */
// import CryptoJS from 'crypto-js';
import Geolocation from "./Geolocation";
import Sidebar from "./Sidebar";
import Timer from "./Timer";
import Templates from './Templates';
import Encryption from "./Encryption";
import BotRequests from "./BotRequests";
import EmojiHandler from "./EmojiHandler";

export default class MainPage {
  constructor(element, baseURL) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('element is not HTMLElement');
    }
    this.container = element;
    this.baseURL = baseURL;
    this.wsURL = 'wss://ahj-chaos-organizer-sergius.herokuapp.com'
    this.currentChunk = 0;
    this.fetching = false;
    this.cancellation = false;
    this.decryption = false;
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
  }

  async init(data) {
    this.userID = data.user.id;
    this.container.insertAdjacentHTML('afterbegin', Templates.startMarkUp);
    this.appContent = this.container.querySelector('.app__content');
    this.appContent.insertAdjacentHTML('beforeend', Templates.chatsHeaderMarkup(data.user.login));
    this.appContent.insertAdjacentHTML('beforeend', Templates.appMessagesMarkup());
    this.appMessages = this.container.querySelector('.app__messages');
    this.appMessages.insertAdjacentHTML('beforeend', Templates.previewFileMarkup());
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
    this.emoji = new EmojiHandler(this.container, this.baseURL)
    this.encryptionBtn = this.container.querySelector('.button.mail_lock').closest('.btn-wrap');
    this.crypto = new Encryption(this.container, this.baseURL);
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
    this.infoBtn.addEventListener('click', () => this.infoTooltip.classList.remove('d_none'))
    this.infoTooltipBtn.addEventListener('click', () => this.infoTooltip.classList.add('d_none'))
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

  async onMicroBtnClick() {
    this.contentType = 'audio';
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  }

  async onVideoBtnClick() {
    this.contentType = 'video';
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    this.previewRecord.classList.remove('d_none')
    this.previewRecord.srcObject = this.stream;
    this.previewRecord.play();
  }

  onGeoBtnClick() {
    const promise = Geolocation.getLocation(this.showPopup)
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
        await this.onMicroBtnClick();
      }
      if (evt.target.closest('.btn-wrap').querySelector('.button.video')) {
        await this.onVideoBtnClick();
      }
      if (evt.target.closest('.btn-wrap').querySelector('.button.geo')) {
        this.onGeoBtnClick();
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
      this.attachFile();
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
    this.attachFile(description);
  }

  async sendingFile(description) {
    const formData = new FormData();
    const dataEncrypt = {
      encrypt: this.crypto.encryption
    }
    formData.append('user', this.userID);
    formData.append('dialog', this.checkDialog());
    formData.append('dialogID', this.activeChatID);
    formData.append('file', this.file);
    formData.append('description', description);
    formData.append('encryption', JSON.stringify(dataEncrypt));
    formData.append('password', this.crypto.encryptPassword)
    const request = await fetch(`${this.baseURL}/files`, {
      method: 'POST',
      body: formData,
    });
    const result = await request.json();
    return result;
  }

  async attachFile(description = '') {
    const result = await this.sendingFile(description);
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
      this.crypto.encryption = false;
      this.crypto.encryptPassword = null;
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

  async getTextMesData() {
    const { encryption } = await this.inputProcessing();
    const { content } = await this.inputProcessing();
    return {
      type: 'text_message',
      data: {
        encryption,
        password: this.crypto.encryptPassword,
        user: this.userID,
        dialog: this.checkDialog(),
        dialogID: this.activeChatID,
        message: content,
      },
    }
  }

  async onMaininputKeydown(evt) {
    if (evt.code === 'Enter') {
      evt.preventDefault();
      const data = await this.getTextMesData();
      this.sendData(data);
    }
  }

  async onSendBtnClick(evt) {
    if (evt.target.closest('.btn-wrap')) {
      const data = await this.getTextMesData();
      this.sendData(data);
    }
  }

  sendData(data) {
    this.ws.send(JSON.stringify(data));
    this.mainInput.innerText = '';
    this.emojiList.classList.add('d_none');
    this.messagesContent.classList.remove('emoji');
    this.crypto.encryption = false;
    this.crypto.encryptPassword = null;
    this.encryptionBtn.classList.remove('checked');
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
        this.messagesContent.insertAdjacentHTML('afterbegin', this.messageTemplate(
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
        this.chatsList.insertAdjacentHTML('beforeend', Templates.chatsUsersListItemMarkup(
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
      this.groupList.insertAdjacentHTML('beforeend', Templates.chatsGroupsItemMarkup(
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

  messageTemplate(className, message, time, userName, mesID, fileObj = '', encryption, password) {
    let lockClassName;
    let button;
    let filePreview;
    let template;
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
      if (message.weather || message.Valute || message.facts) {
        chaosClassName = 'left';
        chaosUserName = 'chaos';
      }
      content = MainPage.chaosMesEngine(message).content;
      bodyID = MainPage.chaosMesEngine(message).bodyID;
    }
    if (fileObj) {
      template = this.fileTemplateEngine(fileObj)
      if (fileObj && !encryption) {
        filePreview = Templates.fileMarkup(template, fileObj)
      }
      if (fileObj && encryption) {
        if (message) {
          content = this.crypto.encryptMessage(message, password);
        }
        filePreview = `
        <div class="encryptedFile">
          <span class="ecryptedTitle">Зашифрованный файл:</span>
          <span class="encryptedFile__content">${this.crypto.encryptMessage(Templates.fileMarkup(template, fileObj), password)}</span>
        </div>`
      }
    } else {
      template = '';
      filePreview = '';
    }

    return Templates.messageMarkup({ chaosClassName, mesID, bodyID, chaosUserName, time, filePreview, lockClassName, content, button, })
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

  fileTemplateEngine(fileObj) {
    let fileTemplate;
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
    return fileTemplate;
  }
}