import { Component, ElementRef, ViewChild } from '@angular/core';
import { CreateuserService } from '../../app/createuser.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-createuser',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './createuser.component.html',
  styleUrl: './createuser.component.css'
})
export class CreateuserComponent {
  @ViewChild('uname') username!: ElementRef;
  @ViewChild('pass') password!: ElementRef;
  @ViewChild('pass2') validpassword!: ElementRef;
  typedPassword: boolean = false;
  show: boolean = false;

  constructor(private createuserservice: CreateuserService) { };

  ngAfterViewInit() {
    this.typedPassword = this.password.nativeElement.value.length > 0;
  }

  submitUserInfo() {
    const username = this.username.nativeElement.value;
    const password = this.password.nativeElement.value;
    const validPassword = this.validpassword.nativeElement.value;

    if (password === validPassword) {
      console.log(username, password, validPassword);
      const data = {
        UserName: username,
        PasswordHashed: password
      };
      console.log(this.createuserservice.apiKey);
      this.createuserservice.sendUserData(data).subscribe({
        next: res => console.log('Success:', res),
        error: err => console.error('Error:', err)
      });
    } else {
      window.alert('Passwords must match');
    }
  }

  showPassword() {
    this.show = !this.show;
    this.password.nativeElement.type = this.show ? 'text' : 'password';
    this.validpassword.nativeElement.type = this.show ? 'text' : 'password';
  }

  editPassword() {
    const input = this.password.nativeElement.value;
    const input2 = this.validpassword.nativeElement.value;
    this.typedPassword = input.length > 0 || input2.length > 0;
    console.log(this.typedPassword);
  }
}
