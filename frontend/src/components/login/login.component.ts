import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @ViewChild('pass') password!: ElementRef;
  typedPassword: boolean = false;
  show: boolean = false;

  ngAfterViewInit() {
    this.typedPassword = this.password.nativeElement.value.length > 0;
  }

  submitUserInfo() {
    console.log("working");
  }

  showPassword() {
    this.show = !this.show;
    this.password.nativeElement.type = this.show ? 'text' : 'password';
  }

  editPassword() {
    const input = this.password.nativeElement.value;
    this.typedPassword = input.length > 0;
    console.log(this.typedPassword);
  }
}
