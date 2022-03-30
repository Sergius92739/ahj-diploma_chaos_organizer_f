/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable no-console */
import Sidebar from "./Sidebar";
import Templates from './Templates';
import Encryption from "./Encryption";
import BotRequests from "./BotRequests";
import EmojiHandler from "./EmojiHandler";
import MediaHandler from "./MediaHandler";
import FileInputHandler from "./FileInputHandler";
import Utils from "./utils/utils";

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
    this.decryption = false;
    // this.weatherKey = 'eca3c39a199c6467336e7a5e2a1db49e';
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
    this.sendBtnBox = this.container.querySelector('.footer-controls__send-btn');
    this.mediaBtnsBox = this.container.querySelector('.footer-controls__media');
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
    this.messagesFooter = this.container.querySelector('.messages__footer');
    this.popup = this.container.querySelector('.app__popup');
    this.popupContent = this.popup.querySelector('.app-popup__text');
    this.emojiList = this.container.querySelector('.messages__emoji');
    this.emoji = new EmojiHandler(this.container, this.baseURL)
    this.encryptionBtn = this.container.querySelector('.button.mail_lock').closest('.btn-wrap');
    this.crypto = new Encryption(this.container, this.baseURL);
    this.infoBtn = this.container.querySelector('.button.inform').closest('.btn-wrap');
    this.infoTooltip = this.container.querySelector('.messages__info');
    this.infoTooltipBtn = this.container.querySelector('.messages-info__button')
    this.botRequists = new BotRequests(this.mainInput, this.crypto, this.baseURL)

    this.asignEventHandlers();
    this.onSocketConnect();
  }

  asignEventHandlers() {
    this.sendBtnBox.addEventListener('click', (evt) => this.onSendBtnClick(evt));
    this.mainInput.addEventListener('keydown', (evt) => this.onMaininputKeydown(evt));
    this.messagesContent.addEventListener('scroll', (evt) => this.onScroll(evt));
    this.infoBtn.addEventListener('click', () => this.infoTooltip.classList.remove('d_none'))
    this.infoTooltipBtn.addEventListener('click', () => this.infoTooltip.classList.add('d_none'))
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

  async getTextMesData() {
    const { encryption } = await this.botRequists.inputProcessing();
    const { content } = await this.botRequists.inputProcessing();
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
      this.mediaHandler = new MediaHandler(this.container, {
        ws: this.ws,
        user: this.userID,
        dialogID: this.activeChatID,
        url: this.baseURL,
      })
      this.fileInputHandler = new FileInputHandler(this.container, {
        ws: this.ws,
        user: this.userID,
        dialogID: this.activeChatID,
        url: this.baseURL,
        crypto: this.crypto,
      })
      this.wsInterval();
    });
    this.ws.addEventListener('message', (evt) => this.onWsMessage(evt));
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
    if (typeof message !== 'object' && Utils.checkLink(message)) {
      content = Utils.getLink(message);
    }

    if (typeof message === 'object') {
      if (message.weather || message.Valute || message.facts) {
        chaosClassName = 'left';
        chaosUserName = 'chaos';
      }
      content = BotRequests.chaosMesEngine(message).content;
      bodyID = BotRequests.chaosMesEngine(message).bodyID;
    }
    if (fileObj) {
      template = FileInputHandler.fileTemplateEngine(fileObj, this.baseURL)
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
}