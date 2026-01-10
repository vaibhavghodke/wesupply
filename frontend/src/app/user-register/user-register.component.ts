import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent {
  firstname = '';
  lastname = '';
  userid = '';
  password = '';
  email = '';
  primary_phone = '';
  secondary_phone = '';
  address = '';
  city = '';

  submitting = false;
  error: string | null = null;

  constructor(private api: ApiService, public router: Router) {}

  async submit() {
    this.error = null;
    // stronger client-side validation
    if (!this.firstname || !this.lastname || !this.userid || !this.password || !this.email || !this.primary_phone || !this.city) {
      this.error = 'Please fill all required fields.';
      return;
    }
    if (!this.isEmailValid()) { this.error = 'Please enter a valid email address.'; return; }
    if (!this.isPhoneValid(this.primary_phone)) { this.error = 'Please enter a valid 10-digit primary phone.'; return; }
    if (this.secondary_phone && !this.isPhoneValid(this.secondary_phone)) { this.error = 'Please enter a valid 10-digit secondary phone.'; return; }
    if (!this.isPasswordStrong()) { this.error = 'Password must be at least 8 characters and include letters and numbers.'; return; }

    this.submitting = true;
    try {
      const payload: any = {
        firstname: this.firstname,
        lastname: this.lastname,
        userid: this.userid,
        password: this.password,
        email: this.email,
        primary_phone: this.primary_phone,
        city: this.city,
        role: 'user',
        // optional fields
        secondary_phone: this.secondary_phone || undefined,
        address: this.address || undefined,
        created_by: 'web'
      };

      await this.api.createUser(payload);
      // navigate back to dashboard after successful registration
      this.router.navigate(['/']);
    } catch (e: any) {
      if (e && e.error && e.error.error) this.error = e.error.error;
      else this.error = 'Failed to create user';
    } finally {
      this.submitting = false;
    }
  }

  isEmailValid() {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(this.email);
  }

  isPhoneValid(p: string) {
    const clean = String(p || '').replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(clean);
  }

  isPasswordStrong() {
    const pw = String(this.password || '');
    return pw.length >= 8 && /[0-9]/.test(pw) && /[A-Za-z]/.test(pw);
  }

  canSubmit() {
    return !this.submitting && this.firstname && this.lastname && this.userid && this.password && this.email && this.primary_phone && this.city && this.isEmailValid() && this.isPhoneValid(this.primary_phone) && this.isPasswordStrong();
  }
}
