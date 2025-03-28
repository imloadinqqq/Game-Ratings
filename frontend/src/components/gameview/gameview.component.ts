import { Component, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';;
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gameview',
  imports: [CommonModule],
  templateUrl: './gameview.component.html',
  styleUrl: './gameview.component.css'
})
export class GameviewComponent {

  constructor(private http: HttpClient) { }

  readonly GAMES_URL = 'http://localhost:8080/api/games';
  readonly API_KEY = '9_yInw3N1UQeeRk5qLzqKZzn';

  games$: Observable<any> | undefined;

  getGames() {
    const headers = new HttpHeaders({
      'X-API-KEY': this.API_KEY
    });

    this.games$ = this.http.get(this.GAMES_URL, { headers });
  }
}
