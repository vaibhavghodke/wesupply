import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { ManageItemsComponent } from './manage-items/manage-items.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'item/:id', component: ItemDetailsComponent },
  { path: 'item/name/:name', component: ItemDetailsComponent },
  { path: 'manage-items', component: ManageItemsComponent }
  ,{ path: 'order-summary', component: OrderSummaryComponent }
  ,{ path: 'register', component: UserRegisterComponent }
  ,{ path: 'manage-users', component: ManageUsersComponent }
];

@NgModule({
  declarations: [AppComponent, DashboardComponent, ItemDetailsComponent, ManageItemsComponent, OrderSummaryComponent, UserRegisterComponent, ManageUsersComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
