import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    try {
      const fetched = await this.api.getItems();
      const isActive = (it: any) => (it && it.stock && String(it.stock).toLowerCase() === 'active');
      this.items = (fetched || []).slice().sort((a: any, b: any) => {
        const aActive = isActive(a);
        const bActive = isActive(b);
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        // otherwise keep alphabetical order by name for determinism
        return String((a.name || '')).localeCompare(String((b.name || '')));
      });
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

  viewItemDetails(item: any) {
    if (!item) return;
    if (item.stock && String(item.stock).toLowerCase() === 'inactive') return;
    this.router.navigate(['/item', item.id]);
  }
}
