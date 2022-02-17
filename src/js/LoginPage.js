/* eslint-disable no-console */
import MainPage from "./MainPage";
import Templates from "./Templates";

export default class LoginPage {
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('element is not HTMLElement');
    }
    this.container = element;
    this.baseURL = 'https://ahj-chaos-organizer-sergius.herokuapp.com';
    this.mainPage = new MainPage(this.container, this.baseURL);

    this.onLoginFormSubmit = this.onLoginFormSubmit.bind(this);
    this.onRegisterBtnClick = this.onRegisterBtnClick.bind(this);
    this.onRegisterFormSubmit = this.onRegisterFormSubmit.bind(this);
    this.onPopupBtnCloseClick = this.onPopupBtnCloseClick.bind(this);
    this.onLogoutBtnClick = this.onLogoutBtnClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  init() {
    this.container.innerHTML = '';
    this.container.insertAdjacentHTML('beforeend', Templates.markupLogin);
    this.container.insertAdjacentHTML('beforeend', Templates.markupRegister);
    this.container.insertAdjacentHTML('beforeend', Templates.markupPopup);
    this.container.insertAdjacentHTML('beforeend', Templates.markupLoading);
    this.loadingPage = this.container.querySelector('.app__loading-page');
    this.popup = this.container.querySelector('.app__popup');
    this.popupContent = this.popup.querySelector('.app-popup__text')
    this.popupBtnClose = this.container.querySelector('.app-popup__button');
    this.popupBtnClose.addEventListener('click', this.onPopupBtnCloseClick)
    this.loginElement = this.container.querySelector('.app__login-page');
    this.registerElement = this.container.querySelector('.app__register-page');
    this.loginForm = document.forms.login_form;
    this.loginForm.addEventListener('submit', this.onLoginFormSubmit);
    this.registerForm = document.forms.register_form;
    this.registerForm.addEventListener('submit', this.onRegisterFormSubmit);
    this.avatarElement = document.querySelector('.register-page__file-element');
    this.avatar = document.querySelector('.register-page__avatar')
    this.avatarElement.addEventListener('change', this.onChange)
    this.registerBtn = this.container.querySelector('.register-page__link');
    this.registerBtn.addEventListener('click', this.onRegisterBtnClick);
  }

  onChange() {
    const file = Array.from(this.avatarElement.files)[0];
    this.blobURL = URL.createObjectURL(file);
    this.avatar.style.backgroundImage = `url('${this.blobURL}')`;
    this.avatar.innerHTML = '';
  }

  showPopup(text) {
    this.popup.classList.remove('d_none');
    this.popupContent.textContent = text;
  }

  onPopupBtnCloseClick() {
    this.popup.className = 'app__popup d_none';
    this.popupContent.textContent = '';
  }

  async onLoginFormSubmit(evt) {
    evt.preventDefault();
    this.loadingPage.classList.remove('d_none');
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      body: new FormData(this.loginForm),
    });
    const result = await response.json();
    this.loginForm.reset();
    if (result.success) {
      this.loadingPage.classList.add('d_none');
      this.hideLoginPage();
      this.mainPage.init(result.data);
      this.mainPage.btnLogout.addEventListener('click', this.onLogoutBtnClick);
    } else {
      this.loadingPage.classList.add('d_none');
      this.showPopup('Неверный логин или пароль')
    }
  }

  onLogoutBtnClick() {
    this.mainPage.ws.close();
    this.init();
    this.mainPage.fetching = false;
    this.mainPage.currentChunk = 0;
  }

  async onRegisterFormSubmit(evt) {
    evt.preventDefault();
    this.loadingPage.classList.remove('d_none');
    URL.revokeObjectURL(this.blobURL);
    const formData = new FormData(this.registerForm);
    if (this.avatarElement.value) {
      const file = Array.from(this.avatarElement.files)[0];
      formData.append('avatar', file);
    }
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    this.registerForm.reset();
    if (result.success) {
      this.loadingPage.classList.add('d_none');
      this.hideRegisterPage();
      this.mainPage.init(result.data);
      this.mainPage.btnLogout.addEventListener('click', this.onLogoutBtnClick);
    }
  }

  onRegisterBtnClick() {
    this.loginElement.classList.add('d_none');
    this.registerElement.classList.remove('d_none');
  }

  hideRegisterPage() {
    this.registerElement.classList.add('d_none');
  }

  hideLoginPage() {
    this.loginElement.classList.add('d_none');
  }

  showLoginPage() {
    this.loginElement.classList.remove('d_none');
  }
}