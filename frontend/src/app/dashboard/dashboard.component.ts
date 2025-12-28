import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  items: any[] = [];
  name = '';
  description = '';

  categories = [
    'Cement','Tiling','Painting','Water Proofing','Plywood, MDF & HDHMR','Fevicol','Wires','Switches & Sockets','Hinges, Channels & Handles','Kitchen Systems & Accessories','Wardrobe & Bed Fittings','Door Locks & Hardware'
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    try {
      //this.items = await this.api.getItems();
    } catch (e) {
      console.error('Failed to load items', e);
    }
  }

  async add() {
    if (!this.name) return;
    await this.api.createItem({ name: this.name, description: this.description });
    this.name = '';
    this.description = '';
    await this.load();
  }

  async remove(id: number) {
    await this.api.deleteItem(id);
    await this.load();
  }

  getSlug(c: string) {
    return c.toLowerCase().replace(/[,&]/g,  '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
