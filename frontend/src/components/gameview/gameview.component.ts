import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
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
  readonly PLATFORMS_URL = 'http:/localhost:8080/api/platforms'

  games$: Observable<string[]> | undefined;
  gameDetails$: Observable<any> | undefined;
  platforms$: Observable<any> | undefined;

  getGameTitles() {
    const headers = new HttpHeaders({
      'X-API-KEY': this.API_KEY
    });

    this.games$ = this.http.get<any[]>(this.GAMES_URL, { headers }).pipe(
      map(games => games
        .sort((a, b) => new Date(a.ReleaseDate).getTime() - new Date(b.ReleaseDate).getTime())
        .map(game => game.GameTitle)
      )
    );

  }

  getGameDetails() {
    const headers = new HttpHeaders({
      'X-API-KEY': this.API_KEY
    });

    this.gameDetails$ = this.http.get<any[]>(this.GAMES_URL, { headers });
  }

  getPlatforms() {
    const headers = new HttpHeaders({
      'X-API-KEY': this.API_KEY
    });

    this.platforms$ = this.http.get<any[]>(this.PLATFORMS_URL, { headers })
  }

  clear() {
    this.games$ = of([]);
    this.gameDetails$ = of([]);
    this.platforms$ = of([]);
  }
}
