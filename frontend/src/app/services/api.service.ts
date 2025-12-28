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

  async deleteItem(id: number) {
    return await firstValueFrom(this.http.delete(`${this.base}/items/${id}`));
  }
}
