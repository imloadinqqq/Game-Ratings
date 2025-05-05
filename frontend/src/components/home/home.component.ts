import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameviewService } from '../../services/gameview.service';
import { LoginService } from '../../services/login.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-gameview',
  imports: [CommonModule, RouterModule, NgxPaginationModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  games: { gameID: any, gameTitle: string, imageUrl: string }[] = [];
  @Input('data') covers: string[] = [];
  page: number = 1;
  uname: any = "";

  constructor(private gameviewService: GameviewService, private loginService: LoginService) { }

  fetchCovers() {
    this.gameviewService.getGameCovers().subscribe(gameCovers => {
      console.log("Fetching: ", gameCovers);
      this.games = gameCovers;
    });
  }

  ngOnInit() {
    // set the username from login service
    this.loginService.getUsername().subscribe(res => {
      this.uname = res.username;
      console.log(this.uname);
    });
    this.fetchCovers();
  }
}
