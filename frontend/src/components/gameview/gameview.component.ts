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

  apiKey: string = '';

  constructor(private http: HttpClient) { }

  readonly GAMES_URL = 'http://localhost:8080/api/games';
  readonly PLATFORMS_URL = 'http://localhost:8080/api/platforms';
  readonly COVERS_URL = 'http://localhost:8080/api/game-covers';
  readonly KEY_URL = 'http://localhost:3000/api/key';

  games$: Observable<string[]> | undefined;
  gameDetails$: Observable<any> | undefined;
  platforms$: Observable<any> | undefined;
  covers$: Observable<string[]> | undefined;

  getGameTitles() {
    const headers = new HttpHeaders({
      'X-API-KEY': this.apiKey
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
      'X-API-KEY': this.apiKey
    });

    this.gameDetails$ = this.http.get<any[]>(this.GAMES_URL, { headers });
  }

  getPlatforms() {
    const headers = new HttpHeaders({
      'X-API-KEY': this.apiKey
    });

    this.platforms$ = this.http.get<any[]>(this.PLATFORMS_URL, { headers });
    console.log(this.platforms$);
  }

  getGameCovers() {
    const headers = new HttpHeaders({ 'X-API-KEY': this.apiKey });

    this.http.get<{ ImageData: string }[]>(this.COVERS_URL, { headers }).subscribe(data => {
      this.covers$ = of(data.map(item => `data:image/png;base64,${item.ImageData}`));
    });
  }

  ngOnInit(): void {
    this.http.get<{ apiKey: string }>(this.KEY_URL).subscribe(response => {
      this.apiKey = response.apiKey;
    });
    this.getGameCovers();
  }

  clear() {
    this.games$ = of([]);
    this.gameDetails$ = of([]);
    this.platforms$ = of([]);
  }
}
