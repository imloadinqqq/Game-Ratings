import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from '../../app/login.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  @ViewChild('uname') username!: ElementRef;
  @ViewChild('pass') password!: ElementRef;
  typedPassword: boolean = false;
  show: boolean = false;

  constructor(private loginservice: LoginService) { };

  ngAfterViewInit() {
    this.typedPassword = this.password.nativeElement.value.length > 0;
  }

  submitUserInfo() {
    const username = this.username.nativeElement.value;
    const password = this.password.nativeElement.value;
    console.log(username, password);
    const data = {
      UserName: username,
      PasswordHashed: password
    };
    console.log(this.loginservice.apiKey);
    this.loginservice.sendUserData(data).subscribe({
      next: res => console.log('Success:', res),
      error: err => console.error('Error:', err)
    });
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
