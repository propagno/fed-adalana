import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductCheckoutComponent } from './product-checkout/product-checkout.component';

export const catalogRoutes: Routes = [
  {
    path: '',
    component: CatalogComponent
  },
  {
    path: 'products/:id',
    component: ProductDetailsComponent
  },
  {
    path: 'products/:id/checkout',
    component: ProductCheckoutComponent
  }
];

