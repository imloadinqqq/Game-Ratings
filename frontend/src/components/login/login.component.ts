import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';

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

  constructor(private loginservice: LoginService, private router: Router) { };

  ngAfterViewInit() {
    this.typedPassword = this.password.nativeElement.value.length > 0;
  }

  login() {
    const username = this.username.nativeElement.value;
    const password = this.password.nativeElement.value;

    // prevent default
    if (username.length == 0 || password.length == 0) {
      return;
    }
    console.log(username, password);
    const data = {
      UserName: username,
      PasswordHashed: password
    };
    console.log(this.loginservice.apiKey);
    this.loginservice.logInUser(data).subscribe({
      next: res => {
        console.log(res.status);
        if (res.status === 200) {
          console.log('Successful login');
          this.router.navigate(['/home']);
        } else if (res.status === 401) {
          window.alert("Incorrect Username or Password");
        }
      },
      error: err => console.error('Error:', err),
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
