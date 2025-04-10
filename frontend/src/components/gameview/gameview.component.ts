import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameviewService } from '../../app/gameview.service';

@Component({
  selector: 'app-gameview',
  imports: [CommonModule, RouterModule],
  templateUrl: './gameview.component.html',
  styleUrl: './gameview.component.css'
})
export class GameviewComponent {
  covers: string[] = [];
  gameTitles: string[] = [];

  constructor(private gameviewService: GameviewService) { }

  fetchCovers() {
    this.gameviewService.getGameCovers().subscribe(covers => {
      this.covers = covers;
    });
  }

  fetchGameTitles() {
    this.gameviewService.getGameTitles().subscribe(titles => {
      this.gameTitles = titles;
    });
  }

  ngOnInit() {
    this.fetchCovers();
  }
}
