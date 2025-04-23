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
  covers: string[] = [];
  gameTitles: string[] = [];
  uname: any = "";

  constructor(private gameviewService: GameviewService, private loginService: LoginService) { }

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
    // set the username from login service
    this.loginService.getUsername().subscribe(res => {
      this.uname = res.username;
      console.log(this.uname);
    });
    this.fetchCovers();
  }
}
