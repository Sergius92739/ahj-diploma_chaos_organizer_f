export default class FileInputHandler {
  constructor(container, options) {
    this.container = container;
    this.ws = options.ws
    this.activeChatID = options.dialogID;
    this.userID = options.user;
    this.baseURL = options.url;
    this.crypto = options.crypto;
    this.fileInput = this.container.querySelector('.file__input');
    this.wrapFileInput = this.container.querySelector('.file-input__wrap');
    this.dropTooltip = this.container.querySelector('.dropTooltip');
    this.previewFile = this.container.querySelector('.messages__preview-file.preview');
    this.previewImage = this.previewFile.querySelector('.preview__image');
    this.previewInput = this.previewFile.querySelector('.preview__input');
    this.previewCancelBtn = this.previewFile.querySelector('.preview__btn.cancel');
    this.previewSendBtn = this.previewFile.querySelector('.preview__btn.send');
    this.messagesContent = this.container.querySelector('.messages__content');
    this.popup = this.container.querySelector('.app__popup');
    this.groupList = this.container.querySelector('.chats__group-list');
    this.encryptionBtn = this.container.querySelector('.button.mail_lock').closest('.btn-wrap');

    this.fileInput.addEventListener('change', (evt) => this.onFileIputChange(evt));
    this.wrapFileInput.addEventListener('click', (evt) => this.onWrapFileInputClick(evt));
    this.previewCancelBtn.addEventListener('click', () => this.onPreviewCancelBtnClick());
    this.previewSendBtn.addEventListener('click', () => this.onPreviewSendBtnClick());
    this.messagesContent.addEventListener('dragover', (evt) => this.onAppMessagesDragover(evt));
    this.messagesContent.addEventListener('dragleave', () => this.onAppMessagesDragleave());
    this.messagesContent.addEventListener('drop', (evt) => this.onDrop(evt));

  }

  async onDrop(evt) {
    evt.preventDefault();
    this.file = await [...evt.dataTransfer.files][0];
    this.previewURL = URL.createObjectURL(this.file);
    this.adaptationPreview(this.file);
  }

  onAppMessagesDragleave() {
    this.hideTooltip();
  }

  onAppMessagesDragover(evt) {
    evt.preventDefault()
    this.showTooltip();
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

  async onPreviewSendBtnClick() {
    this.previewImage.innerHTML = '<div class="preview__loading"></div>';
    let description = '';
    if (this.previewInput.value) {
      description = this.previewInput.value;
      this.previewInput.value = '';
    }
    this.attachFile(description);
  }

  onPreviewCancelBtnClick() {
    this.hideTooltip();
    this.hidePreviewFile();
    URL.revokeObjectURL(this.previewURL);
  }

  showPopup(text) {
    this.popup.classList.remove('d_none');
    this.popupContent.textContent = text;
  }

  onWrapFileInputClick(evt) {
    if (evt.target.closest('.btn-wrap.file-input__wrap')) {
      const event = new MouseEvent('click');
      this.fileInput.dispatchEvent(event);
    }
  }

  async onFileIputChange(evt) {
    evt.preventDefault();
    this.file = await [...evt.currentTarget.files][0];
    if (this.file) {
      this.previewURL = URL.createObjectURL(this.file);
      this.adaptationPreview(this.file);
    }
  }

  showTooltip() {
    this.messagesContent.className = 'messages__content tooltip';
  }

  hideTooltip() {
    this.messagesContent.className = 'messages__content'
  }

  showPreviewFile() {
    this.previewFile.classList.remove('d_none');
  }

  hidePreviewFile() {
    this.previewFile.classList.add('d_none');
    this.previewImage.style.backgroundImage = `none`;
    this.previewImage.innerHTML = '';
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

  static fileTemplateEngine(fileObj, url) {
    let fileTemplate;
    if (fileObj.type.startsWith('audio') && fileObj.type !== 'audio/webm;codecs=opus') {
      fileTemplate = `<audio src="${url}/${fileObj.name}" controls></audio>`
    }
    if (fileObj.type === 'audio/webm;codecs=opus') {
      fileTemplate = `<div class="voice">Голосовое сообщение:</div><audio src="${this.baseURL}/${fileObj.name}" controls></audio>`
    }
    if (fileObj.type.startsWith('video')) {
      fileTemplate = `<video src="${url}/${fileObj.name}" width="350" height="200" controls></video>`
    }
    if (fileObj.type.startsWith('text')) {
      fileTemplate = `<object data="${url}/${fileObj.name}" width="350" height="450" type="text/plain"></object>`
    }
    if (fileObj.type.startsWith('application')) {
      fileTemplate = `<object data="${url}/${fileObj.name}" width="350" height="450"></object>`
    }
    if (fileObj.type.startsWith('image')) {
      fileTemplate = `<img src="${url}/${fileObj.name}">`
    }
    return fileTemplate;
  }
}