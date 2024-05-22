import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  user = new BehaviorSubject<User>(null);
  // token: string = null;
  tokenExpirationTimer: any;


  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  signUp(email: string, password: string){
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDOllLmxe8HHTNHUBmXVRrL9otfcdX9y5E', {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap(resData => {
     this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }

  login(email: string, password: string){
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDOllLmxe8HHTNHUBmXVRrL9otfcdX9y5E', {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
     }));
  }

  logout(){
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if(this.tokenExpirationTimer){
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogin(){
      const userDataStr: string | null = localStorage.getItem('userData');
      
      if (!userDataStr) {
        return; // No user data in localStorage
      }
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if(!userData){
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if(loadedUser.token){
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  
}

  autoLogout(expirationDuration: number){
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    },expirationDuration)
  }

  private handleError(errorResponse:HttpErrorResponse){
    let errorMsg = 'An unknown error occurred!';
    if(!errorResponse.error || !errorResponse.error.error){
      return throwError(() => {
        new Error(errorMsg);
      });
    }
    
    switch (errorResponse.error.error.message) 
    {
      case 'EMAIL_EXISTS':
        errorMsg = 'This email exists already.';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMsg = 'The login credentials entered are incorrect.';
        break;
    
    }
    return throwError(() => {
      return new Error(errorMsg);
    })
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number){
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.autoLogout(expiresIn * 1000);
    this.user.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}
