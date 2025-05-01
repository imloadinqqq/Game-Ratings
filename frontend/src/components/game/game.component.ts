import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameviewService } from '../../app/gameview.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  game: any = null;
  currentGameID!: number;
  releaseYear: number = 0;
  coverImageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private gameviewService: GameviewService,
    private titleService: Title,
    private router: Router,
  ) {
    this.titleService.setTitle(this.route.snapshot.data['title']);
  }


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = Number(idParam);
      if (idParam) {
        this.currentGameID = id;
        this.fetchGameByID(idParam);
        this.fetchGameCoverByID(idParam);
      }
    });
  }

  nextGame() {
    this.currentGameID++;
    this.router.navigate(['/game', this.currentGameID]);
  }

  prevGame() {
    if (this.currentGameID > 1) {
      this.currentGameID--;
      this.router.navigate(['/game', this.currentGameID]);
    } else {
      window.alert("You can't have a negative id :D");
    }
  }

  getYear(game: any) {
    this.releaseYear = new Date(game?.ReleaseDate).getFullYear();
  }

  fetchGameByID(gameID: string) {
    this.gameviewService.getGameByID(gameID).subscribe({
      next: (games) => {
        if (games && games.length > 0) {
          this.game = games[0];
          console.log('Fetched game:', this.game);
          console.log(this.game?.GameTitle);
          this.getYear(this.game);
          console.log(this.releaseYear);
          this.titleService.setTitle(this.game.GameTitle);
        } else {
          console.log('No game found with this ID');
        }
      },
      error: (err) => console.error('Error fetching game:', err)
    });
  }

  fetchGameCoverByID(gameID: string) {
    this.gameviewService.getGameCoverByID(gameID).subscribe({
      next: (cover) => this.coverImageUrl = cover?.imageUrl || null,
      error: (err) => console.error('Error fetching game cover:', err)
    });
  }
}
