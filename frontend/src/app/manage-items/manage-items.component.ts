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
  image = '';
  stock = 'active';
  editingItem: any = null;
  editName = '';
  editDescription = '';
  editImage = '';
  editStock = 'active';
  formErrors: any = {};

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
    this.formErrors = {};
    if (!this.name) this.formErrors.name = 'Name is required';
    if (!this.description) this.formErrors.description = 'Description is required';
    if (!this.image) this.formErrors.image = 'Image is required';
    if (!this.stock) this.formErrors.stock = 'Stock is required';
    if (Object.keys(this.formErrors).length > 0) return;
    try {
      await this.api.createItem({ name: this.name, description: this.description, image: this.image, stock: this.stock });
      this.name = '';
      this.description = '';
      this.image = '';
      this.stock = 'active';
      await this.load();
    } catch (e) {
      console.error('Failed to create item', e);
    }
  }

  edit(item: any) {
    this.editingItem = item;
    this.editName = item.name;
    this.editDescription = item.description || '';
    this.editImage = item.image || '';
    this.editStock = item.stock || 'inactive';
  }

  cancelEdit() {
    this.editingItem = null;
    this.editName = '';
    this.editDescription = '';
  }

  async update() {
    this.formErrors = {};
    if (!this.editName) this.formErrors.editName = 'Name is required';
    if (!this.editDescription) this.formErrors.editDescription = 'Description is required';
    if (!this.editImage) this.formErrors.editImage = 'Image is required';
    if (!this.editStock) this.formErrors.editStock = 'Stock is required';
    if (Object.keys(this.formErrors).length > 0) return;
    if (!this.editName || !this.editingItem) return;
    try {
      await this.api.updateItem(this.editingItem.id, { name: this.editName, description: this.editDescription, image: this.editImage, stock: this.editStock });
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
