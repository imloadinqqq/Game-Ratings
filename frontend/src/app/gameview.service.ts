import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameviewService {
  private apiKey$: Observable<string>;

  readonly KEY_URL = 'http://localhost:3000/api/key';
  readonly GAMES_URL = 'http://localhost:8080/api/games';
  readonly PLATFORMS_URL = 'http://localhost:8080/api/platforms';
  readonly COVERS_URL = 'http://localhost:8080/api/game-covers';

  constructor(private http: HttpClient) {
    this.apiKey$ = this.http.get<{ apiKey: string }>(this.KEY_URL).pipe(
      map(res => res.apiKey)
    );
  }

  getGameTitles(): Observable<string[]> {
    return this.apiKey$.pipe(
      map(apiKey => new HttpHeaders({ 'X-API-KEY': apiKey })),
      switchMap(headers =>
        this.http.get<any[]>(this.GAMES_URL, { headers }).pipe(
          map(games => games
            .sort((a, b) => new Date(a.ReleaseDate).getTime() - new Date(b.ReleaseDate).getTime())
            .map(game => game.GameTitle)
          )
        )
      )
    );
  }

  getGameCovers(): Observable<{ gameID: any, gameTitle: string, imageUrl: string }[]> {
    return this.apiKey$.pipe(
      map(apiKey => new HttpHeaders({ 'X-API-KEY': apiKey })),
      switchMap(headers =>
        // get request to fetch id, title, and image data
        this.http.get<{ GameID: any, GameTitle: string, ImageData: string }[]>(this.COVERS_URL, { headers }).pipe(
          // structure data
          map(data =>
            data.map(item => ({
              gameID: item.GameID,
              gameTitle: item.GameTitle,
              imageUrl: `data:image/png;base64,${item.ImageData}`
            }))
          )
        )
      )
    );
  }
}
