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
  editingItem: any = null;
  editName = '';
  editDescription = '';

  categories = [
    'Cement','Tiling','Painting','Water Proofing','Plywood, MDF & HDHMR','Fevicol','Wires','Switches & Sockets','Hinges, Channels & Handles','Kitchen Systems & Accessories','Wardrobe & Bed Fittings','Door Locks & Hardware'
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    try {
      this.items = await this.api.getItems();
    } catch (e) {
      console.error('Failed to load items', e);
    }
  }

  async add() {
    if (!this.name) return;
    try {
      await this.api.createItem({ name: this.name, description: this.description });
      this.name = '';
      this.description = '';
      await this.load();
    } catch (e) {
      console.error('Failed to create item', e);
    }
  }

  edit(item: any) {
    this.editingItem = item;
    this.editName = item.name;
    this.editDescription = item.description || '';
  }

  cancelEdit() {
    this.editingItem = null;
    this.editName = '';
    this.editDescription = '';
  }

  async update() {
    if (!this.editName || !this.editingItem) return;
    try {
      await this.api.updateItem(this.editingItem.id, { 
        name: this.editName, 
        description: this.editDescription 
      });
      this.cancelEdit();
      await this.load();
    } catch (e) {
      console.error('Failed to update item', e);
    }
  }

  async remove(id: number) {
    try {
      await this.api.deleteItem(id);
      await this.load();
    } catch (e) {
      console.error('Failed to delete item', e);
    }
  }

  getSlug(c: string) {
    return c.toLowerCase().replace(/[,&]/g,  '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}
