import {Component, OnInit} from '@angular/core';
import {ApiService} from '../services/api.service';
import {Cell} from './cell';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  private wordLength;
  private colHeight;
  private rows;
  private currentRowPos;
  private currentColPos;
  private keyboardLayout;
  private solutionWord;
  private solutionWordArray;
  private rowError;
  private gameState;
  private settingsOpen;
  private hitKeys; // optimisation pour éviter de parcourir tout le clavier
  private language;

  constructor(private apiService: ApiService) {
    this.wordLength = 5;
    this.colHeight = 6;
    this.rowError = -1;
    this.rows = [];
    this.settingsOpen = false;
    this.hitKeys = [];

    this.reset();
    this.setKeyboard();
  }

  async ngOnInit() {
  }

  setKeyboard() {
    this.keyboardLayout = [[], [], []];
    const azertyLayout = [
      ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
      ['W', 'X', 'C', 'V', 'B', 'N']
    ];
    for (const [key, row] of Object.entries(azertyLayout)) {
      for (const letter of row) {
        this.keyboardLayout[key].push(new Cell(letter));
      }
    }
  }

  openSettings() {
    this.settingsOpen = true;
  }

  validateSettings() {
    this.reset();
    this.settingsOpen = false;
  }

  letterInput(letter: string, rowKey: number, cellKey: number) {
    if (this.currentColPos < this.wordLength) {
      this.rows[this.currentRowPos][this.currentColPos].setLetter(letter);
      this.hitKeys.push([rowKey, cellKey]);
      this.currentColPos++;
    }
  }

  backspaceInput() {
    if (this.currentColPos > 0) {
      this.rows[this.currentRowPos][this.currentColPos - 1].setLetter('');
      this.hitKeys.pop();
      this.currentColPos--;
    }
  }

  async validate() {
    const letterInventory = [];
    for (const letter of this.solutionWord) {
      letterInventory.push(letter);
    }
    let victory = true;
    // Get user's word
    const word = this.getInputWord();
    // If the user filled all the cells and the word exists
    if (word.length === +this.wordLength && await this.apiService.checkWord(word, this.language)) {
      const oeWord = Object.entries(word);
      // If the letters are at the same position in the word
      for (const [i, letterS] of this.solutionWordArray) {
        if (this.solutionWordArray[i][1] === oeWord[i][1]) {
          this.rows[this.currentRowPos][i].addClass('correct');
          this.rows[this.currentRowPos][i].removeClass('incorrect');
          this.changeKeyboardClasses(+i, 'correct');
          letterInventory[this.solutionWordArray[i][0]] = '';
        }
      }
      for (const [i, letterS] of this.solutionWordArray) {
        // For each letter of user's word
        for (const [j, letterW] of oeWord) {
          // Check if the letter is the same as the solution (check victory)
          const solutionLetter = this.solutionWord[j];
          if (solutionLetter !== letterW) {
            victory = false;
          }
          // For each letter from solution
          const cell = this.rows[this.currentRowPos][j];
          if (letterW === letterS && letterInventory.includes(letterW)) { // If the letter is present in the solution word
            cell.addClass('misplaced');
            cell.removeClass('incorrect');
            this.changeKeyboardClasses(+j, 'misplaced');
            const index = letterInventory.indexOf(letterW);
            if (index !== -1) {
              letterInventory[index] = '';
              console.log(letterInventory);
            }
          } else { // If the letter is not correct or misplaced, add incorrect class
            cell.addClass('incorrect');
            this.changeKeyboardClasses(+j, 'incorrect');
          }
        }
      }

      this.hitKeys = [];
      // If we reached the end of the tries OR the user found the word
      if (this.currentRowPos === this.colHeight - 1 || victory) {
        this.finish(victory);
      } else {
        this.currentRowPos++;
        this.currentColPos = 0;
      }
      // If the user did not fill all the cells OR the word is incorect
    } else {
      // Flash the row in red
      for (let i = 0; i < 3; i++) {
        await (this.errorRow(100));
      }
    }
  }

  finish(won: boolean) {
    console.log(won);
    if (won) {
      this.gameState = 1; // gagné
    } else {
      this.gameState = 2; // perdu
    }
  }

  async reset() {
    this.rows = [];
    for (let i = 0; i < this.colHeight; i++) {
      this.rows[i] = [];
      for (let j = 0; j < this.wordLength; j++) {
        this.rows[i][j] = new Cell();
      }
    }
    this.currentRowPos = 0;
    this.currentColPos = 0;
    this.gameState = 0; // en cours
    this.solutionWord = await this.apiService.getRandomWord(this.wordLength, this.language);
    console.log(this.solutionWord);
    this.solutionWordArray = Object.entries(this.solutionWord);
    this.resetKeyboard();
  }

  private getInputWord() {
    let word = '';
    for (const cell of this.rows[this.currentRowPos]) {
      word += cell.letter;
    }
    return word.toLowerCase();
  }

  private errorRow(delay: number) {
    return new Promise(resolve => {
      this.rowError = this.currentRowPos;
      setTimeout(() => {
        this.rowError = -1;
        setTimeout(() => resolve(true), delay);
      }, delay);
    });
  }

  private changeKeyboardClasses(wordIndex: number, cls: string) {
    this.keyboardLayout[this.hitKeys[wordIndex][0]][this.hitKeys[wordIndex][1]].addClass(cls);
  }

  private resetKeyboard() {
    for (const row of this.keyboardLayout) {
      for (const key of row) {
        key.clearClasses();
      }
    }
  }

}
