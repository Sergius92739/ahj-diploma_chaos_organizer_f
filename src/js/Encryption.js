/* eslint-disable class-methods-use-this */
import CryptoJS from 'crypto-js';

export default class Encryption {
  constructor(container, url) {
    this.container = container;
    this.encryption = false;
    this.encryptPassword = null;
    this.encryptionBtn = this.container.querySelector('.button.mail_lock').closest('.btn-wrap');
    this.encryptPopup = this.container.querySelector('.messages__encrypt-form');
    this.mesEncryptForm = this.container.querySelector('.messages-encrypt-form__form');
    this.mesDecryptForm = this.container.querySelector('.messages-decrypt-form__form');
    this.mesEncryptFormText = this.container.querySelector('.messages-encrypt-form__text')
    this.mesDecryptFormText = this.container.querySelector('.messages-decrypt-form__text')
    this.mesEncryptFormInput = this.container.querySelector('.messages-encrypt-form__input');
    this.mesDecryptFormInput = this.container.querySelector('.messages-decrypt-form__input');
    this.mesFormButtonClose = this.container.querySelector('.messages-encrypt-form__btn-close');
    this.popup = this.container.querySelector('.app__popup');
    this.popupContent = this.popup.querySelector('.app-popup__text');
    this.messagesContent = this.container.querySelector('.messages__content');
    this.groupList = this.container.querySelector('.chats__group-list');
    this.baseURL = url;

    this.onEncryptionBtnClick = this.onEncryptionBtnClick.bind(this);
    this.onEncryptFormSubmit = this.onEncryptFormSubmit.bind(this);
    this.onMesFormBtnCloseClick = this.onMesFormBtnCloseClick.bind(this);
    this.onMessagesContentClick = this.onMessagesContentClick.bind(this);
    this.onDecryptFormSubmit = this.onDecryptFormSubmit.bind(this);

    this.encryptionBtn.addEventListener('click', this.onEncryptionBtnClick);
    this.mesEncryptForm.addEventListener('submit', this.onEncryptFormSubmit);
    this.mesDecryptForm.addEventListener('submit', this.onDecryptFormSubmit);
    this.mesFormButtonClose.addEventListener('click', this.onMesFormBtnCloseClick);
    this.messagesContent.addEventListener('click', this.onMessagesContentClick);

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

  encryptMessage(word, key) {
    const encJson = CryptoJS.AES.encrypt(JSON.stringify(word), key).toString()
    const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson))
    return encData
  }

  decryptMessage(word, key) {
    const decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8)
    const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8)
    return JSON.parse(bytes)
  }

  showPopup(text) {
    this.popup.classList.remove('d_none');
    this.popupContent.textContent = text;
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

  onEncryptFormSubmit(evt) {
    evt.preventDefault();
    this.encryptPassword = this.mesEncryptFormInput.value;
    this.hideEncryptPopup();
    this.mesEncryptFormInput.value = '';
  }

  async requestDecryption() {
    this.activeChatID = document.querySelector('.chat.active').dataset.id;
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
    return result;
  }

  async onDecryptFormSubmit(evt) {
    evt.preventDefault();
    this.hideEncryptPopup();
    const result = await this.requestDecryption();
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
        const originalText = this.decryptMessage(contentEl.textContent, result.data);
        contentEl.innerHTML = originalText;
        if (text.textContent) {
          const textInfo = this.decryptMessage(text.textContent, result.data)
          text.textContent = textInfo;
        }
      } else {
        this.showPopup('Неверный пароль!')
        this.mesDecryptFormInput.value = '';
      }
    }
  }

  onMesFormBtnCloseClick() {
    this.hideEncryptPopup();
    this.encryptionBtn.classList.remove('checked')
    this.encryption = false;
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
        const result = await this.requestDecryption();
        const originalText = this.encryptMessage(contentEl.innerHTML, result.data);
        contentEl.textContent = originalText;
        if (text.textContent) {
          const textInfo = this.encryptMessage(text.textContent, result.data);
          text.textContent = textInfo;
        }
      }
    }
  }
}