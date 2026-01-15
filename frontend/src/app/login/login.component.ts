import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  userid = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  async submit() {
    this.error = '';
    if (!this.userid || !this.password) {
      this.error = 'Please enter userid and password';
      return;
    }
    this.loading = true;
    try {
      await this.auth.login(this.userid, this.password);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      this.error = err?.error?.error || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
