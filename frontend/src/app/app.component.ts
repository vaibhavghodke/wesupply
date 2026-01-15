import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'BuildIt';
  currentUser: any = null;
  showUserMenu = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => this.currentUser = u);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
