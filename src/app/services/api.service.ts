import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url = 'http://alixgoguey.fr/words/wordapi.php';

  constructor(private http: HttpClient) {}

  public getRandomWord(length: number, language: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(this.url + '?cmd=rand&size=' + length + '&lang=' + language).subscribe((data: any) => {
        if (data.ok) { resolve(data.word); }
        else { reject(data.ok); }
      });
    });
  }

  public checkWord(word: string, language: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.get(this.url + '?cmd=exists&word=' + word + '&lang=' + language).subscribe((data: any) => {
        if (data.ok) { resolve(data.exists); }
        else { reject(data.ok); }
      });
    });
  }
}


