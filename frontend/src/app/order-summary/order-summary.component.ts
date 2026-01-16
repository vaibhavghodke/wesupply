import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  currentUser: any = null;

  constructor(private api: ApiService, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(u => {
      this.currentUser = u;
      this.load();
    });
  }

  async load() {
    this.loading = true;
    try {
      if (this.currentUser && this.currentUser.role !== 'admin') {
        // show only orders created by this user
        const createdBy = this.currentUser.userid || this.currentUser.email || this.currentUser.id || null;
        this.orders = await this.api.getOrders({ created_by: createdBy });
      } else {
        // admin or not-logged-in: show all orders
        this.orders = await this.api.getOrders();
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      this.loading = false;
    }
  }

  back() {
    this.router.navigate(['/']);
  }
}
