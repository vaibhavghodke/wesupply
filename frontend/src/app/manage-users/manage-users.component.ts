import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  editing: any = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.users = await this.api.getUsers();
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      this.loading = false;
    }
  }

  edit(u: any) {
    this.editing = { ...u };
  }

  cancel() { this.editing = null; }

  async save() {
    if (!this.editing) return;
    try {
      await this.api.updateUser(this.editing.id, this.editing);
      this.editing = null;
      await this.load();
    } catch (e: any) {
      alert(e?.error?.error || 'Failed to update user');
    }
  }

  async remove(id: number) {
    if (!confirm('Delete this user?')) return;
    try {
      await this.api.deleteUser(id);
      await this.load();
    } catch (e) {
      alert('Failed to delete user');
    }
  }
}
