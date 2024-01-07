export default class Timer {
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('element is not HTMLElement');
    }
    this.timer = element;
    this.min = 0;
    this.sec = 0;
    this.stopTime = true;

    this.timeCycle = this.timeCycle.bind(this);
  }

  startTimer() {
    if (this.stopTime) {
      this.stopTime = !this.stopTime;
      this.timeCycle();
    }
  }

  stopTimer() {
    if (!this.stopTime) {
      this.stopTime = !this.stopTime;
    }
  }

  timeCycle() {
    if (!this.stopTime) {
      this.sec = +this.sec + 1;

      if (this.sec === 60) {
        this.min = +this.min + 1;
        this.sec = 0;
      }

      if (this.sec < 10 || this.sec === 0) {
        this.sec = `0${+this.sec}`;
      }

      if (this.min < 10 || this.min === 0) {
        this.min = `0${+this.min}`;
      }

      this.timer.textContent = `${this.min}:${this.sec}`;

      setTimeout(this.timeCycle, 1000);
    }
  }

  resetTimer() {
    this.timer.innerHTML = '00:00';
    this.stopTime = true;
    this.min = 0;
    this.sec = 0;
  }
}