/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
import { debounceTime, fromEvent, pluck, filter, switchMap } from "rxjs";
import MainPage from "./MainPage";

export default class Sidebar {
  constructor(container, options) {
    this.container = container;
    this.ws = options.ws;
    this.activeChatID = options.dialogID;
    this.userID = options.user;
    this.baseURL = 'https://ahj-chaos-organizer-sergius.herokuapp.com';

    this.onMessagesHeaderBtnsClick = this.onMessagesHeaderBtnsClick.bind(this);
    this.onBackBtnClick = this.onBackBtnClick.bind(this);
    this.onAttachmentMenuClick = this.onAttachmentMenuClick.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSidebarFoundMessagesClick = this.onSidebarFoundMessagesClick.bind(this);
  }

  init() {
    this.appContent = this.container.querySelector('.app__content');
    this.appContent.insertAdjacentHTML('beforeend', Sidebar.sidebarMarkup);
    this.messagesHeaderBtns = this.container.querySelector('.messages-header__buttons');
    this.sideBarSearch = this.container.querySelector('.app__sidebar.search-mes');
    this.sideBarInfo = this.container.querySelector('.app__sidebar.info');
    this.sidebarBtnClose = this.container.querySelectorAll('.button.close-sb');
    this.attachmentMenu = this.container.querySelector('.sidebar__attachments-list');
    this.backBtn = this.container.querySelector('.button.back');
    this.previewMenu = this.container.querySelector('[data-name="preview-menu"]');
    this.mainInput = this.container.querySelector('.footer-controls__input');
    this.groupList = this.container.querySelector('.chats__group-list');
    this.numbPhotos = this.container.querySelector('[data-number="photo"]')
    this.numbVideo = this.container.querySelector('[data-number="video"]')
    this.numbLink = this.container.querySelector('[data-number="link"]')
    this.numbVoice = this.container.querySelector('[data-number="voice"]')
    this.numbFile = this.container.querySelector('[data-number="file"]')
    this.numbAudio = this.container.querySelector('[data-number="audio"]')
    this.previewPhotos = this.container.querySelector('[data-id="photo"]')
    this.previewVideos = this.container.querySelector('[data-id="video"]')
    this.previewVoices = this.container.querySelector('[data-id="voice"]')
    this.previewAudios = this.container.querySelector('[data-id="audio"]')
    this.previewLinks = this.container.querySelector('[data-id="link"]')
    this.previewTitle = this.container.querySelector('.sidebar-preview__title')
    this.messagesContainer = this.container.querySelector('.messages__content');
    this.sidebarForm = this.container.querySelector('.sidebar__search.search');
    this.sidebarSearchInput = this.container.querySelector('[data-id="sidebar_search"]');
    this.sidebarSearchBtnsOn = this.container.querySelector('[data-id="sidebar_btn-on"]')
    this.sidebarSearchBtnsOf = this.container.querySelector('[data-id="sidebar_btn-of"]');
    this.popup = this.container.querySelector('.app__popup');
    this.sidebarFoundMessages = this.container.querySelector('.sidebar__found-list')


    this.asignEventHandlers();
    this.activateMessagesObserver()
  }

  onInput(evt) {
    if (!evt.target.value) {
      this.sidebarFoundMessages.innerHTML = '';
    }
  }

  validateSearchInput() {
    this.sidebarSearchInput.addEventListener('input', this.onInput)
    fromEvent(this.sidebarSearchInput, 'input').pipe(
      debounceTime(100),
      pluck('target', 'value'),
      filter((value) => value.trim() !== ''),
      switchMap((value) => {
        this.searchInputValue = value;
        return this.getRequest(value)
      })
    )
      .subscribe((value) => {
        this.drawPreviewMessage(value);
      })
  }

  drawPreviewMessage(data) {
    this.sidebarFoundMessages.innerHTML = '';
    if (data.length) {
      data.forEach((item) => {
        this.sidebarFoundMessages.insertAdjacentHTML('beforeend', this.previewMessageMarkup(item))
      })
    }
  }

  previewMessageMarkup(data) {
    let replace;
    if (this.searchInputValue) {
      replace = data.message.replace(this.searchInputValue, (value) => `<span class="marker">${value}</span>`)
    }
    return `<li class="found-list__found" data-id="${data.mesID}">
    <div class="found__title">
      <div class="found__text">${data.userName}</div>
      <div class="found__time">${data.time}</div>
    </div>
    <div class="found__content">${replace}</div>
  </li>`
  }

  async getRequest(value) {
    const formData = new FormData();
    formData.append('value', value);
    formData.append('dialog', this.checkDialog());
    formData.append('dialogID', this.activeChatID)
    const request = await fetch(`${this.baseURL}/validate_mes`, {
      method: 'POST',
      body: formData,
    });
    const result = await request.json();
    if (result.success) {
      return result.data;
    }
    return [];
  }

  showPopup(text) {
    this.popup.classList.remove('d_none');
    this.popupContent.textContent = text;
  }

  activateMessagesObserver() {
    this.messagesObserver = new MutationObserver(async () => {
      const formData = new FormData();
      formData.append('dialog', this.checkDialog());
      formData.append('dialogID', this.activeChatID)
      const request = await fetch(`${this.baseURL}/attachments`, {
        method: 'POST',
        body: formData,
      });
      const result = await request.json();
      if (result.success) {
        this.reloadPhotos(result.data.images);
        this.reloadVideos(result.data.video);
        this.reloadVoices(result.data.voice);
        this.reloadAudios(result.data.audio);
        this.reloadLinks(result.data.links);
      }
    });

    this.messagesObserver.observe(this.messagesContainer, {
      childList: true,
      characterData: true,
      subtree: true,
    })
  }

  reloadPhotos(data) {
    this.previewPhotos.innerHTML = '';
    this.numbPhotos.textContent = data.length;
    data.forEach((image) => {
      this.previewPhotos.insertAdjacentHTML('beforeend', this.previewPhotoMarkup(image))
    })
  }

  reloadVideos(data) {
    this.previewVideos.innerHTML = '';
    this.numbVideo.textContent = data.length;
    data.forEach((video) => {
      this.previewVideos.insertAdjacentHTML('beforeend', this.previewVideoMarkup(video))
    })
  }

  reloadVoices(data) {
    this.previewVoices.innerHTML = '';
    this.numbVoice.textContent = data.length;
    data.forEach((voice) => {
      this.previewVoices.insertAdjacentHTML('beforeend', this.previewAudioMarkup(voice))
    })
  }

  reloadAudios(data) {
    this.previewAudios.innerHTML = '';
    this.numbAudio.textContent = data.length;
    data.forEach((audio) => {
      this.previewAudios.insertAdjacentHTML('beforeend', this.previewAudioMarkup(audio))
    })
  }

  reloadLinks(data) {
    this.previewLinks.innerHTML = '';
    this.numbLink.textContent = data.length;
    data.forEach((elem) => {
      this.previewLinks.insertAdjacentHTML('beforeend', Sidebar.previewLinkMarkup(elem));
    })
  }

  asignEventHandlers() {
    this.messagesHeaderBtns.addEventListener('click', this.onMessagesHeaderBtnsClick);
    this.sidebarBtnClose.forEach((elem) => {
      elem.addEventListener('click', (evt) => {
        evt.target.closest('.app__sidebar').classList.add('d_none');
        this.mainInput.classList.remove('sb-active');
      })
    });
    this.backBtn.addEventListener('click', this.onBackBtnClick);
    this.attachmentMenu.addEventListener('click', this.onAttachmentMenuClick);
    this.sidebarForm.addEventListener('submit', (evt) => evt.preventDefault());
    this.sidebarSearchBtnsOn.addEventListener('click', () => {
      this.sidebarSearchInput.focus();
      this.sidebarSearchBtnsOn.classList.add('d_none');
      this.sidebarSearchBtnsOf.classList.remove('d_none');
    });
    this.sidebarSearchBtnsOf.addEventListener('click', () => {
      this.sidebarSearchInput.blur();
      this.sidebarSearchBtnsOn.classList.remove('d_none');
      this.sidebarSearchBtnsOf.classList.add('d_none');
      this.sidebarFoundMessages.innerHTML = '';
      this.sidebarSearchInput.value = '';
    });
    this.sidebarSearchInput.addEventListener('focus', () => {
      this.sidebarSearchBtnsOn.classList.add('d_none');
      this.sidebarSearchBtnsOf.classList.remove('d_none');
    });
    document.addEventListener('click', (evt) => {
      if (!evt.target.closest('.search__items') && !evt.target.closest('.sidebar__found-list')) {
        document.querySelectorAll('.search__button_on').forEach((elem) => {
          elem.className = 'search__button_on';
        })
        document.querySelectorAll('.search__button_of').forEach((elem) => {
          elem.className = 'search__button_of d_none';
        })
        document.querySelectorAll('.search__input').forEach((elem) => {
          elem.value = '';
        })
        this.sidebarFoundMessages.innerHTML = '';
      }
    });
    this.sidebarFoundMessages.addEventListener('click', this.onSidebarFoundMessagesClick)
    this.validateSearchInput();
  }

  onSidebarFoundMessagesClick(evt) {
    if (evt.target.closest('.found-list__found')) {
      this.target = evt.target.closest('.found-list__found');
      const { id } = evt.target.closest('.found-list__found').dataset;
      this.scrollByElement(id)
    }
  }

  scrollByElement(id) {
    if (this.messagesContainer.querySelector(`[data-id="${id}"]`)) {
      const foundMes = this.messagesContainer.querySelector(`[data-id="${id}"]`);
      foundMes.scrollIntoView(true);
      foundMes.style.backgroundColor = '#747faa77'
      setTimeout(() => {
        foundMes.style.backgroundColor = '';
      }, 2000);
    } else {
      this.messagesContainer.scrollTop = 0;
      setTimeout(() => this.scrollByElement(id), 100)
    }
  }

  onMessagesHeaderBtnsClick(evt) {
    if (evt.target.closest('.btn-wrap').querySelector('.button.find')) {
      this.mainInput.classList.add('sb-active');
      this.sideBarSearch.classList.toggle('d_none');
      if (!this.sideBarInfo.classList.contains('d_none')) {
        this.sideBarInfo.classList.toggle('d_none');
      }
    }
    if (evt.target.closest('.btn-wrap').querySelector('.button.menu')) {

      this.mainInput.classList.add('sb-active');
      this.sideBarInfo.classList.toggle('d_none');
      if (!this.sideBarSearch.classList.contains('d_none')) {
        this.sideBarSearch.classList.toggle('d_none');
      }
    }
  }

  onBackBtnClick() {
    this.previewMenu.classList.add('d_none');
    this.attachmentMenu.classList.remove('d_none');
  }

  onAttachmentMenuClick(evt) {
    if (evt.target.closest('[data-name="photo"]')) {
      const { name } = evt.target.closest('[data-name="photo"]').dataset;
      this.changeClassList(name)
      this.previewTitle.textContent = 'Фото'
    }
    if (evt.target.closest('[data-name="video"]')) {
      const { name } = evt.target.closest('[data-name="video"]').dataset;
      this.changeClassList(name);
      this.previewTitle.textContent = 'Видео'
    }
    if (evt.target.closest('[data-name="audio"]')) {
      const { name } = evt.target.closest('[data-name="audio"]').dataset;
      this.changeClassList(name);
      this.previewTitle.textContent = 'Аудиофайлы';
    }
    if (evt.target.closest('[data-name="voice"]')) {
      const { name } = evt.target.closest('[data-name="voice"]').dataset;
      this.changeClassList(name);
      this.previewTitle.textContent = 'Голосовые сообщения';
    }
    if (evt.target.closest('[data-name="link"]')) {
      const { name } = evt.target.closest('[data-name="link"]').dataset;
      this.changeClassList(name);
      this.previewTitle.textContent = 'Ссылки';
    }
  }

  changeClassList(name) {
    this.previewMenu.classList.remove('d_none');
    this.attachmentMenu.classList.add('d_none');
    this.previewMenu.querySelectorAll('ul').forEach((elem) => {
      elem.classList.add('visually_hidden');
    });
    document.querySelector(`[data-id="${name}"]`).classList.remove('visually_hidden');
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

  previewPhotoMarkup(fileName) {
    return `<li class="photo__item"><a href="${this.baseURL}/${fileName}" target="_blank">
    <img src="${this.baseURL}/${fileName}">
  </a></li>`
  }

  previewVideoMarkup(fileName) {
    return `<li class="video__item"><a href="${this.baseURL}/${fileName}" target="_blank">
    <video src="${this.baseURL}/${fileName}" controls></video>
  </a></li>`
  }

  previewAudioMarkup(fileName) {
    return `<li class="voice__item"><audio src="${this.baseURL}/${fileName}" controls></audio>
      <div class="btn-wrap">
        <a class="button download" href="${this.baseURL}/${fileName}" download="${fileName}" rel="noopener"></a>
      </div>
    </li> `
  }

  static previewLinkMarkup(elem) {
    return `<li class="link__item">
    <div class="link-item__img"></div>
    <div class="link-item__content">
      <div class="link-item__data">${elem.time}</div>
      <div class="link-item__link">${MainPage.getLink(elem.message)}</div>
    </div>
  </li>`
  }
}