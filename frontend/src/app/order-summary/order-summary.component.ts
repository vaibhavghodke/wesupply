import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent implements OnInit {
  orders: any[] = [];
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.orders = await this.api.getOrders();
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
