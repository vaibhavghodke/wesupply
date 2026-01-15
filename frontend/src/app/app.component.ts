import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'BuildIt';
  currentUser: any = null;
  showUserMenu = false;
  @ViewChild('userMenuContainer', { static: false }) userMenuContainer!: ElementRef;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.user$.subscribe(u => this.currentUser = u);
    // close menu on navigation
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.showUserMenu = false;
      }
    });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  // Close user menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showUserMenu) return;
    const el = this.userMenuContainer && this.userMenuContainer.nativeElement;
    if (el && !el.contains(event.target as Node)) {
      this.showUserMenu = false;
    }
  }

  // Close on Escape key
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.showUserMenu) this.showUserMenu = false;
  }
}
