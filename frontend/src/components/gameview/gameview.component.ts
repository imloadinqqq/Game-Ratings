import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameviewService } from '../../app/gameview.service';
import { LoginService } from '../../app/login.service';

@Component({
  selector: 'app-gameview',
  imports: [CommonModule, RouterModule],
  templateUrl: './gameview.component.html',
  styleUrl: './gameview.component.css'
})
export class GameviewComponent {
  gameID: any[] = [];
  covers: string[] = [];
  titles: string[] = [];
  uname: any = "";

  constructor(private gameviewService: GameviewService, private loginService: LoginService) { }

  fetchCovers() {
    this.gameviewService.getGameCovers().subscribe(gameCovers => {
      this.gameID = gameCovers.map(gc => gc.gameID);
      this.titles = gameCovers.map(gc => gc.gameTitle);
      this.covers = gameCovers.map(gc => gc.imageUrl);
    });
  }

  ngOnInit() {
    this.fetchCovers();
    // set the username from login service
    this.loginService.getUsername().subscribe(res => {
      this.uname = res.username;
      console.log(this.uname);
    });
  }
}
