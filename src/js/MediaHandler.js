import Geolocation from "./Geolocation";
import Timer from "./Timer";

export default class MediaHandler {
  constructor(container, options) {
    this.container = container;
    this.ws = options.ws;
    this.activeChatID = options.dialogID;
    this.userID = options.user;
    this.baseURL = options.url;
    this.mediaBtnsBox = this.container.querySelector('.footer-controls__media');
    this.mediaRecordBox = this.container.querySelector('.footer-controls__media.record')
    this.popup = this.container.querySelector('.app__popup');
    this.cancellation = false;
    this.timer = new Timer(document.querySelector('.record-timer'));
    this.groupList = this.container.querySelector('.chats__group-list');
    this.previewRecord = this.container.querySelector('.messages__preview-record');

    this.onMediaBtnsClick = this.onMediaBtnsClick.bind(this);
    this.onMediaRecordClick = this.onMediaRecordClick.bind(this);
    this.startRecord = this.startRecord.bind(this);
    this.dataavailable = this.dataavailable.bind(this);
    this.stopRecord = this.stopRecord.bind(this);

    this.mediaBtnsBox.addEventListener('click', this.onMediaBtnsClick);
    this.mediaRecordBox.addEventListener('click', this.onMediaRecordClick);
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

  showPopup(text) {
    this.popup.classList.remove('d_none');
    this.popupContent.textContent = text;
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

 async attachFile() {
    const result = await this.sendingFile();
    if (result.success) {
      const data = {
        type: 'messages',
        data: {
          dialog: this.checkDialog(),
          dialogID: this.activeChatID,
        }
      }
      this.ws.send(JSON.stringify(data));
    }
  }

  async sendingFile() {
    const formData = new FormData();
    const dataEncrypt = {
      encrypt: false,
    }
    formData.append('user', this.userID);
    formData.append('dialog', this.checkDialog());
    formData.append('dialogID', this.activeChatID);
    formData.append('file', this.file);
    formData.append('description', '');
    formData.append('encryption', JSON.stringify(dataEncrypt));
    formData.append('password', null)
    const request = await fetch(`${this.baseURL}/files`, {
      method: 'POST',
      body: formData,
    });
    const result = await request.json();
    return result;
  }

  startRecord() {
    this.mediaBtnsBox.classList.add('d_none');
    this.mediaRecordBox.classList.remove('d_none');
    this.timer.startTimer();
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
}