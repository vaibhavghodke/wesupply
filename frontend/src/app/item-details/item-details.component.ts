import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent implements OnInit {
  item: any = null;
  itemDetails: any[] = [];
  sizes: string[] = [];
  groupedDetails: any[] = []; // rows grouped by type+company+order_type with size->price map
  availableSizes: string[] = []; // sizes available for current filter
  showOrderForm = false;
  // separate filters used for the background list (do not bind modal form to these)
  listFilterType: string = '';
  listFilterCompany: string = '';
  listFilterOrderType: string = '';
  
  // Form data
  selectedType: string = '';
  selectedCompany: string = '';
  selectedOrderType: string = '';
  selectedPrice: number = 0;
  selectedSize: string = '';
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
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
    , private auth: AuthService
  ) {}

  ngOnInit(): void {
    const itemId = this.route.snapshot.paramMap.get('id');
    const itemName = this.route.snapshot.paramMap.get('name');
    this.auth.user$.subscribe(u => this.currentUser = u);
    
    if (itemId) {
      this.loadItem(parseInt(itemId));
    } else if (itemName) {
      this.loadItemByName(decodeURIComponent(itemName));
    }
  }

  onSizeChange() {
    if (this.selectedType && this.selectedCompany && this.selectedOrderType && this.selectedSize) {
      const selectedDetail = this.itemDetails.find(d => 
        d.type === this.selectedType && 
        d.company === this.selectedCompany && 
        d.order_type === this.selectedOrderType &&
        d.size === this.selectedSize
      );
      if (selectedDetail) {
        this.selectedPrice = selectedDetail.selling_price;
      } else {
        this.selectedPrice = 0;
      }
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
      this.computeSizesAndGrouped();
      this.initializeFilters();
    } catch (e) {
      console.error('Failed to load item details', e);
    }
  }

  computeSizesAndGrouped() {
    // compute unique sizes and sort them in logical sequence (numeric + unit aware)
    const uniqueSizes = [...new Set(this.itemDetails.map(d => d.size))];
    this.sizes = uniqueSizes.sort(this.sizeCompare);

    // group by type|company|order_type
    const map: any = {};
    this.itemDetails.forEach(d => {
      const key = `${d.type}||${d.company}||${d.order_type}`;
      if (!map[key]) {
        map[key] = { type: d.type, company: d.company, order_type: d.order_type, prices: {} };
      }
      map[key].prices[d.size] = d.selling_price;
    });

    this.groupedDetails = Object.values(map);
  }

  // comparator to order sizes like 250g, 500g, 1kg in logical numeric order
  sizeCompare = (a: string, b: string) => {
    const pa = this.parseSize(a);
    const pb = this.parseSize(b);
    if (pa && pb) {
      if (pa.category === pb.category) {
        return pa.value - pb.value;
      }
      // order categories: mass, volume, count, other
      const order: any = { mass: 0, volume: 1, count: 2, other: 3 };
      return (order[pa.category] || 3) - (order[pb.category] || 3);
    }
    if (pa) return -1;
    if (pb) return 1;
    return a.localeCompare(b);
  }

  parseSize(s: string) {
    if (!s || typeof s !== 'string') return null;
    const txt = s.trim().toLowerCase();
    // match number and unit
    const m = txt.match(/^([0-9]*\.?[0-9]+)\s*([a-zA-Z]+)?$/);
    if (!m) return null;
    const num = parseFloat(m[1]);
    const unit = (m[2] || '').toLowerCase();
    // categorize and normalize to base unit value
    const massUnits: any = { kg: 1000, g: 1, mg: 0.001 };
    const volumeUnits: any = { l: 1000, ml: 1 }; // normalize to ml
    if (unit in massUnits) {
      return { category: 'mass', value: num * massUnits[unit] };
    }
    if (unit in volumeUnits) {
      return { category: 'volume', value: num * volumeUnits[unit] };
    }
    // common counts
    if (unit === 'pcs' || unit === 'pc' || unit === 'piece' || unit === 'pieces') {
      return { category: 'count', value: num };
    }
    // fallback: treat as other
    return { category: 'other', value: num };
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

    // compute available sizes for current filter
    this.availableSizes = [...new Set(filtered.map(d => d.size))].sort();

    // if size already selected, update price from matching detail
    if (this.selectedType && this.selectedCompany && this.selectedOrderType && this.selectedSize) {
      const selectedDetail = this.itemDetails.find(d => 
        d.type === this.selectedType && 
        d.company === this.selectedCompany && 
        d.order_type === this.selectedOrderType &&
        d.size === this.selectedSize
      );
      if (selectedDetail) {
        this.selectedPrice = selectedDetail.selling_price;
      }
    } else {
      // reset selectedPrice if size not selected
      if (!this.selectedSize) this.selectedPrice = 0;
    }
  }

  // getter to show grouped rows filtered by background list filters (not modal form values)
  get displayedGroupedDetails() {
    return this.groupedDetails.filter(g => {
      if (this.listFilterType && g.type !== this.listFilterType) return false;
      if (this.listFilterCompany && g.company !== this.listFilterCompany) return false;
      if (this.listFilterOrderType && g.order_type !== this.listFilterOrderType) return false;
      return true;
    });
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
        Size: ${this.selectedSize}
        Price: ₹${this.selectedPrice} per ${this.selectedSize}
        Customer: ${this.customerName}
        Email: ${this.customerEmail}
        Phone: ${this.customerPhone}
      `.trim();

      const contact = `${this.customerName} | ${this.customerEmail} | ${this.customerPhone}`;

      const createdBy = this.currentUser ? (this.currentUser.userid || this.currentUser.email || this.currentUser.id) : 'System';
      const order = {
        order_summary: orderSummary,
        contact: contact,
        status: 'Open',
        created_by: createdBy
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
      this.selectedSize = '';
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

