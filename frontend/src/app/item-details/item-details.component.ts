import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit {
  item: any = null;
  itemDetails: any[] = [];
  showOrderForm = false;
  
  // Form data
  selectedType: string = '';
  selectedCompany: string = '';
  selectedOrderType: string = '';
  selectedPrice: number = 0;
  selectedQuantity: string = '';
  customerName: string = '';
  customerPhone: string = '';
  customerEmail: string = '';
  
  // Filtered options
  types: string[] = [];
  companies: string[] = [];
  orderTypes: string[] = [];
  
  // Email autocomplete suggestions
  emailSuggestions: string[] = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com'];
  showEmailSuggestions: boolean = false;
  filteredEmailSuggestions: string[] = [];
  
  // Form validation
  formErrors: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id');
    const itemName = this.route.snapshot.paramMap.get('name');
    
    if (itemId) {
      this.loadItem(parseInt(itemId));
    } else if (itemName) {
      this.loadItemByName(decodeURIComponent(itemName));
    }
  }

  async loadItem(id: number) {
    try {
      const items = await this.api.getItems();
      this.item = items.find((i: any) => i.id === id);
      if (this.item) {
        await this.loadItemDetails(this.item.name);
      }
    } catch (e) {
      console.error('Failed to load item', e);
    }
  }

  async loadItemByName(name: string) {
    try {
      const items = await this.api.getItems();
      this.item = items.find((i: any) => i.name === name);
      if (this.item) {
        await this.loadItemDetails(name);
      }
    } catch (e) {
      console.error('Failed to load item', e);
    }
  }

  async loadItemDetails(itemName: string) {
    try {
      this.itemDetails = await this.api.getItemDetails(itemName);
      this.initializeFilters();
    } catch (e) {
      console.error('Failed to load item details', e);
    }
  }

  initializeFilters() {
    // Get unique types
    this.types = [...new Set(this.itemDetails.map(d => d.type))].sort();
    
    // Get unique companies
    this.companies = [...new Set(this.itemDetails.map(d => d.company))].sort();
    
    // Get unique order types
    this.orderTypes = [...new Set(this.itemDetails.map(d => d.order_type))].sort();
  }

  onOrderNow() {
    this.showOrderForm = true;
  }

  onTypeChange() {
    this.updateFilteredOptions();
  }

  onCompanyChange() {
    this.updateFilteredOptions();
  }

  onOrderTypeChange() {
    this.updateFilteredOptions();
  }

  updateFilteredOptions() {
    let filtered = this.itemDetails;

    if (this.selectedType) {
      filtered = filtered.filter(d => d.type === this.selectedType);
    }
    if (this.selectedCompany) {
      filtered = filtered.filter(d => d.company === this.selectedCompany);
    }
    if (this.selectedOrderType) {
      filtered = filtered.filter(d => d.order_type === this.selectedOrderType);
    }

    // Update available options based on current selections
    if (!this.selectedType) {
      this.types = [...new Set(this.itemDetails.map(d => d.type))].sort();
    } else {
      const typeFiltered = this.itemDetails.filter(d => d.type === this.selectedType);
      this.companies = [...new Set(typeFiltered.map(d => d.company))].sort();
    }

    if (!this.selectedCompany) {
      this.companies = [...new Set(
        (this.selectedType ? this.itemDetails.filter(d => d.type === this.selectedType) : this.itemDetails)
          .map(d => d.company)
      )].sort();
    }

    // Update price and quantity when all selections are made
    if (this.selectedType && this.selectedCompany && this.selectedOrderType) {
      const selectedDetail = filtered.find(d => 
        d.type === this.selectedType && 
        d.company === this.selectedCompany && 
        d.order_type === this.selectedOrderType
      );
      if (selectedDetail) {
        this.selectedPrice = selectedDetail.price;
        this.selectedQuantity = selectedDetail.quantity;
      }
    }
  }

  onEmailInput() {
    if (this.customerEmail && this.customerEmail.includes('@')) {
      this.showEmailSuggestions = false;
      return;
    }
    
    if (this.customerEmail && !this.customerEmail.includes('@')) {
      const localPart = this.customerEmail;
      this.filteredEmailSuggestions = this.emailSuggestions.map(suffix => localPart + suffix);
      this.showEmailSuggestions = true;
    } else {
      this.showEmailSuggestions = false;
    }
  }

  selectEmailSuggestion(suggestion: string) {
    this.customerEmail = suggestion;
    this.showEmailSuggestions = false;
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.customerName || this.customerName.trim().length < 2) {
      this.formErrors.customerName = 'Name must be at least 2 characters';
    }

    if (!this.customerPhone) {
      this.formErrors.customerPhone = 'Phone number is required';
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(this.customerPhone.replace(/\D/g, ''))) {
        this.formErrors.customerPhone = 'Please enter a valid 10-digit Indian phone number';
      }
    }

    if (!this.customerEmail) {
      this.formErrors.customerEmail = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.customerEmail)) {
        this.formErrors.customerEmail = 'Please enter a valid email address';
      }
    }

    if (!this.selectedType) {
      this.formErrors.type = 'Please select a type';
    }

    if (!this.selectedCompany) {
      this.formErrors.company = 'Please select a company';
    }

    if (!this.selectedOrderType) {
      this.formErrors.orderType = 'Please select an order type';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  async onSubmitOrder() {
    if (!this.validateForm()) {
      return;
    }

    try {
      const orderSummary = `
        Item: ${this.item.name}
        Type: ${this.selectedType}
        Company: ${this.selectedCompany}
        Order Type: ${this.selectedOrderType}
        Quantity: ${this.selectedQuantity}
        Price: ₹${this.selectedPrice} per ${this.selectedQuantity}
        Customer: ${this.customerName}
        Email: ${this.customerEmail}
        Phone: ${this.customerPhone}
      `.trim();

      const contact = `${this.customerName} | ${this.customerEmail} | ${this.customerPhone}`;

      const order = {
        order_summary: orderSummary,
        contact: contact,
        status: 'Open',
        created_by: 'System'
      };

      await this.api.createOrder(order);
      alert('Order placed successfully!');
      // Close modal after successful submission
      this.showOrderForm = false;
      // reset form fields (keep filters)
      this.selectedType = '';
      this.selectedCompany = '';
      this.selectedOrderType = '';
      this.selectedPrice = 0;
      this.selectedQuantity = '';
      this.customerName = '';
      this.customerPhone = '';
      this.customerEmail = '';
    } catch (e) {
      console.error('Failed to create order', e);
      alert('Failed to place order. Please try again.');
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  hideSuggestions() {
  setTimeout(() => this.showEmailSuggestions = false, 200);
}

  closeModal(event: any) {
    // close when clicking backdrop
    this.showOrderForm = false;
  }
}

