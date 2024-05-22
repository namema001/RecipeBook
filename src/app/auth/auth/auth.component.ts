import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthResponseData, AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLoginMode: boolean = true;
  isLoading: boolean = false;
  errorMsg: string = null;

  constructor(private authService: AuthService, private router: Router){

  }

 onSwitchMode(){
  this.isLoginMode = !this.isLoginMode;
 }
 OnSubmit(form: NgForm){
  if(!form.valid){
    return;
  }
  this.isLoading = true;
  const email = form.value.mail;
  const password = form.value.password;

  let authObs: Observable<AuthResponseData>;

  if (this.isLoginMode) {
    authObs = this.authService.login(email, password)
  } else {
    authObs = this.authService.signUp(email, password)
  }

  authObs.subscribe({
    next: (res) => {
      console.log(res);
      this.isLoading = false;
      this.router.navigate(['/recipes']);
    },
    error: (errorMsg) => {
      console.log(errorMsg);
      this.errorMsg = errorMsg;
      this.isLoading = false;
    }
  });  

  form.reset();
 }

 onHandleError(){
  this.errorMsg = null;
 }
}
