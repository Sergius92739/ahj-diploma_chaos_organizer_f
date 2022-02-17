import Templates from "./Templates";

export default class EmojiHandler {
  constructor(container, url) {
    this.container = container;
    this.baseURL = url;
    this.emojiList = this.container.querySelector('.messages__emoji');
    this.emojiBtn = this.container.querySelector('.button.smile').closest('.btn-wrap');
    this.mainInput = this.container.querySelector('.footer-controls__input');
    this.messagesContent = this.container.querySelector('.messages__content');

    this.onEmojiListClick = this.onEmojiListClick.bind(this);
    this.onEmojiBtnClick = this.onEmojiBtnClick.bind(this);

    this.emojiList.addEventListener('click', this.onEmojiListClick);
    this.emojiBtn.addEventListener('click', this.onEmojiBtnClick);
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
      this.emojiList.insertAdjacentHTML('beforeend', Templates.emojiMarkup(emoji));
    })
  }

  scrollToBottom() {
    this.messagesContent.scrollTop = this.messagesContent.scrollHeight;
  }
}