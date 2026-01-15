import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  async getItems() {
    return await firstValueFrom(this.http.get<any[]>(`${this.base}/items`));
  }

  async createItem(item: any) {
    return await firstValueFrom(this.http.post(`${this.base}/items`, item));
  }

  async updateItem(id: number, item: any) {
    return await firstValueFrom(this.http.put(`${this.base}/items/${id}`, item));
  }

  async deleteItem(id: number) {
    return await firstValueFrom(this.http.delete(`${this.base}/items/${id}`));
  }

  // Item Details methods
  async getItemDetails(itemName?: string, itemId?: number) {
    let url = `${this.base}/item-details`;
    const params: string[] = [];
    if (itemName) params.push(`item_name=${encodeURIComponent(itemName)}`);
    if (itemId) params.push(`item_id=${itemId}`);
    if (params.length > 0) url += '?' + params.join('&');
    return await firstValueFrom(this.http.get<any[]>(url));
  }

  // Order Summary History methods
  async createOrder(order: any) {
    return await firstValueFrom(this.http.post(`${this.base}/order-summary-history`, order));
  }

  async getOrders(filters?: any) {
    let url = `${this.base}/order-summary-history`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.created_by) params.append('created_by', filters.created_by);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      const queryString = params.toString();
      if (queryString) url += '?' + queryString;
    }
    return await firstValueFrom(this.http.get<any[]>(url));
  }

  // Users
  async createUser(user: any) {
    return await firstValueFrom(this.http.post(`${this.base}/users`, user));
  }

  async getUsers() {
    return await firstValueFrom(this.http.get<any[]>(`${this.base}/users`));
  }

  async updateUser(id: number, user: any) {
    return await firstValueFrom(this.http.put(`${this.base}/users/${id}`, user));
  }

  async deleteUser(id: number) {
    return await firstValueFrom(this.http.delete(`${this.base}/users/${id}`));
  }
  
  // Auth
  async login(userid: string, password: string) {
    return await firstValueFrom(this.http.post(`${this.base}/auth/login`, { userid, password }, { withCredentials: true }));
  }

  async logout() {
    return await firstValueFrom(this.http.post(`${this.base}/auth/logout`, {}, { withCredentials: true }));
  }

  async me() {
    return await firstValueFrom(this.http.get<any>(`${this.base}/auth/me`, { withCredentials: true }));
  }
}
