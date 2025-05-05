import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateuserService {
  apiKey: string = '';

  constructor(private http: HttpClient) {
    this.http.get<{ apiKey: string }>(this.KEY_URL).subscribe(response => {
      this.apiKey = response.apiKey;
    });
  }

  readonly KEY_URL = 'http://localhost:3000/api/key';
  readonly USERS_URL = 'http://localhost:8080/api/users/createUser';

  sendUserData(data: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'X-API-KEY': this.apiKey
      })
    }
    return this.http.post(this.USERS_URL, data, httpOptions);
  }
}
