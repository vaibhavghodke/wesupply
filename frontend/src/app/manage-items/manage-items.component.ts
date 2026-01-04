import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-manage-items',
  templateUrl: './manage-items.component.html',
  styleUrls: ['./manage-items.component.css']
})
export class ManageItemsComponent implements OnInit {
  items: any[] = [];
  name = '';
  description = '';
  editingItem: any = null;
  editName = '';
  editDescription = '';

  constructor(private api: ApiService, private router: Router) {}

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
      await this.api.updateItem(this.editingItem.id, { name: this.editName, description: this.editDescription });
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

  goBack() {
    this.router.navigate(['/']);
  }
}
