import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$ = new BehaviorSubject<any>(null);
  constructor(private api: ApiService) {
    // attempt to hydrate on service init
    this.refresh();
  }

  async refresh() {
    try {
      const res = await this.api.me();
      this.user$.next(res.user || null);
    } catch (e) {
      this.user$.next(null);
    }
  }

  async login(userid: string, password: string) {
    await this.api.login(userid, password);
    await this.refresh();
  }

  async logout() {
    await this.api.logout();
    this.user$.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.user$.value;
  }
}
