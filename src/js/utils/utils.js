export default class Utils {
  static checkLink(value) {
    return value.match(/https?:\/\/[^\s]+/gm) !== null;
  }

  static getLink(value) {
    return value.replace(/https?:\/\/[^\s]+/gm, (link) => `<a href='${link}' target='_blank'>${link}</a>`);
  }
}

