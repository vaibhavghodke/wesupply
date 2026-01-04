import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-order-summary-history',
  templateUrl: './order-summary-history.component.html',
  styleUrls: ['./order-summary-history.component.css']
})
export class OrderSummaryHistoryComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loading = true;
    this.error = null;
    try {
      this.orders = await this.api.getOrders();
    } catch (e: any) {
      console.error('Failed to load orders', e);
      this.error = e?.message || 'Failed to load orders';
    } finally {
      this.loading = false;
    }
  }

  viewOrder(o: any) {
    // For now, navigate to same screen with id param or open details in future
    this.router.navigate(['/orders-summary', o.order_id]);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
