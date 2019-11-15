import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { ErrorService } from '../../../core/services/error.service';


@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  configs = {
    isLogin: true,
    actionText: 'Login',
    buttonActionText: 'Criar conta',
    isLoading: false
  };
  private nameControl =
          new FormControl('', [Validators.required, Validators.minLength(5)]);
  private alive = true;

  @HostBinding('class.app-login-spinner') public applySpinnerClass = true;

  constructor(
    public authService: AuthService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

      // Usado para o botão de Lembreme (rememberMe). Não é aconcelhado te isto na aplicação.
    const userData = this.authService.getRememberMe();
    if (userData) {
      this.email.setValue(userData.email);
      this.password.setValue(userData.password);
    }
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmit(): void {

    this.configs.isLoading = true;

    const operation =
      (this.configs.isLogin)
        ? this.authService.signinUser(this.loginForm.value)
        : this.authService.signupUser(this.loginForm.value);

    operation
      .pipe(
        takeWhile(() => this.alive)
      ).subscribe(
        res => {
          this.authService.setRememberMe(this.loginForm.value);
          const redirect: string = this.authService.redirectUrl || '/dashboard';
          // // Usado para o botão de Lembreme (rememberMe). Não é aconcelhado te isto na aplicação.
          // this.authService.setRememberMe(this.loginForm.value);
          // redirect with router

          this.authService.isAuthenticated
          .pipe(takeWhile(() => this.alive))
          .subscribe((is: boolean) => {
            if (is) {
              this.router.navigate([redirect]);
              this.authService.redirectUrl = null;
              this.configs.isLoading = false;
            }
          });
      },
      err => {
        console.log(err);
        this.configs.isLoading = false;
        this.snackBar.open(this.errorService.getErrorMessage(err), 'Done', {duration: 5000, verticalPosition: 'top'});
      },
      // () => console.log('Observable completed!')
    );

  }

  changeAction(): void {
    this.configs.isLogin = !this.configs.isLogin;
    this.configs.actionText = !this.configs.isLogin ? 'Cadastrar' : 'Login';
    this.configs.buttonActionText = !this.configs.isLogin ? 'Já tenho uma conta' : 'Criar conta';
    !this.configs.isLogin ? this.loginForm.addControl('name', this.nameControl) : this.loginForm.removeControl('name');
  }


  get name(): FormControl { return this.loginForm.get('name') as FormControl; }
  get email(): FormControl { return this.loginForm.get('email') as FormControl; }
  get password(): FormControl { return this.loginForm.get('password') as FormControl; }

  onKeepSigned(): void {
    this.authService.toggleKeepSigned();
  }
  // Usado para o botão de Lembreme (rememberMe). Não é aconcelhado te isto na aplicação.
  onRememberMe(): void {
    this.authService.toggleRememberMe();
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

}
