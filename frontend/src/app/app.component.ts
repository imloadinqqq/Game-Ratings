import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { GameviewComponent } from '../components/gameview/gameview.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameviewComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
