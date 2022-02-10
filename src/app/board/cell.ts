export class Cell {
  private letter;
  private classes;

  constructor(letter = '') {
    this.letter = letter;
    this.classes = [];
  }

  hasClass(className: string) {
    return this.classes.includes(className);
  }

  addClass(className: string) {
    if (!this.classes.includes(className)) {
      this.classes.push(className);
    }
  }

  removeClass(className: string) {
    const classIndex = this.classes.indexOf(className);
    if (classIndex !== -1) {
      this.classes.splice(classIndex, 1);
    }
  }

  clearClasses() {
    this.classes = [];
  }

  getClassesString() {
    return this.classes.join(' ');
  }

  getLetter(): string {
    return this.letter;
  }

  setLetter(letter: string) {
    this.letter = letter;
  }
}
