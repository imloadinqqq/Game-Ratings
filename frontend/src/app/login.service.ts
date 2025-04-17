import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  apiKey: string = '';

  constructor(private http: HttpClient) {
    this.http.get<{ apiKey: string }>(this.KEY_URL).subscribe(response => {
      this.apiKey = response.apiKey;
    });
  }

  readonly KEY_URL = 'http://localhost:3000/api/key';
  readonly USERS_URL = 'http://localhost:8080/api/users';
  readonly LOGIN_URL = 'http://localhost:8080/api/users/login';


  logInUser(data: any): Observable<HttpResponse<any>> {
    const httpOptions = {
      headers: new HttpHeaders({
        'X-API-KEY': this.apiKey
      }),
      observe: 'response' as const,
      withCredentials: true
    }
    return this.http.post(this.LOGIN_URL, data, httpOptions);
  }
}
