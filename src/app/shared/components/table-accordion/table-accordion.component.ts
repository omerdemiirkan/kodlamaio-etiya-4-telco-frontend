import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { BillingAccount } from 'src/app/features/customers/models/billingAccount';
import { Customer } from 'src/app/features/customers/models/customer';
import { MessageService } from 'primeng/api';
import { CustomersService } from 'src/app/features/customers/services/customer/customers.service';
import { Router } from '@angular/router';
import { Offer } from 'src/app/features/offers/models/offer';
import { Product } from 'src/app/features/customers/models/product';
@Component({
  selector: 'app-table-accordion',
  templateUrl: './table-accordion.component.html',
  styleUrls: ['./table-accordion.component.css'],
})
export class TableAccordionComponent implements OnInit {
  @Input() billingAccount!: BillingAccount;
  @Input() customerId!: number;
  @Output() onBillingAccountDelete = new EventEmitter<BillingAccount>();
  customer!: Customer;
  billingAccountToDelete!: BillingAccount;

  product!: Product;
  productToDelete!: Product;

  constructor(
    private messageService: MessageService,
    private customerService: CustomersService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

 
  ngOnInit(): void {
    this.getCustomerById();
    this.messageService.messageObserver.subscribe((data: any) => {
      if (data.data && data.data.acc) {
        this.billingAccountToDelete = data.data.acc;
      }
    });
    this.messages();
  }
  messages() {
    this.messageService.clearObserver.subscribe((data) => {
      if (data == 'r') {
        this.messageService.clear();
      } else if (data == 'c') {
        this.messageService.clear();
        if (this.productToDelete) {
          this.removeProduct();
          this.billingAccount.orders.forEach((order) => {
            order.offers?.forEach((offer) => {
              offer.products = offer.products.filter(
                (p) => p.id != this.productToDelete.id
              );
            });
          });
        } else if (
          this.billingAccountToDelete &&
          this.billingAccountToDelete.orders.map((c) =>
            c.offers?.map((offer) => {
              offer.products.length > 0;
            })
          ) ||
          this.billingAccountToDelete.orders.length > 0
        ) {
          this.messageService.add({
            key: 'offer',
            severity: 'warn',
            detail:
              'The billing account that you want to delete has an active product(s). You can not delete it!',
          });
        } else if (
          this.billingAccountToDelete &&
          this.billingAccountToDelete.orders &&
          this.billingAccountToDelete.orders.length == 0
        ) {
          this.remove();
          this.messageService.add({
            key: 'offer',
            severity: 'warn',
            detail: 'Customer account deleted successfully',
          });
        } else {
          console.log('No problem!...');
        }
      }
    });
  }

  
  productDetail(billingAccount: BillingAccount, offer: Offer) {
    if (offer.type.typeName == 'campaign') {
      let campaignProdOfferId = offer.id.toString();
      let campaignProdOfferName = offer.name;
      let campaignId = offer.type.id.toString();
      let campaignAddressDetail: any = [];
      billingAccount.addresses.forEach(
        (data) => (campaignAddressDetail = data)
      );
      this.messageService.add({
        key: 'product-detail',
        sticky: true,
        severity: 'warn',
        detail:`
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <table class="table" >
                        <tr class="table-header">
                            <th class="col-2">Product Offer ID</th>
                            <th class="col-2">Product Offer Name</th>
                            <th class="col-2">City</th>
                            <th class="col-2">Address Detail</th>
                        </tr>
                        <tr  class="active">
                            <td>${campaignProdOfferId}</td>
                            <td>${campaignProdOfferName}</td>
                            <td>${campaignAddressDetail.city.name}</td>
                            <td>${campaignAddressDetail.description}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
      `,
      });
    }else if (offer.type.typeName == 'catalog') {
      let catalogProdOfferId = offer.id;
      let catalogProdOfferName = offer.name;
      let catalogAddressDetail: any = [];
      billingAccount.addresses.forEach((data) => (catalogAddressDetail = data));
      this.messageService.add({
        key: 'product-detail',
        sticky: true,
        severity: 'warn',
        detail: `
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <table class="table" >
                        <tr class="table-header">
                            <th class="col-2">Product Offer ID</th>
                            <th class="col-2">Product Offer Name</th>
                            <th class="col-2">City</th>
                            <th class="col-2">Address Detail</th>
                        </tr>
                        <tr  class="active">
                            <td>${catalogProdOfferId}</td>
                            <td>${catalogProdOfferName}</td>
                            <td>${catalogAddressDetail.city.name}</td>
                            <td>${catalogAddressDetail.description}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        `,
      });
    }
  }

  getCustomerById() {
    if (this.customerId == undefined) {
      //toast
    } else {
      this.customerService
        .getCustomerById(this.customerId)
        .subscribe((data) => {
          this.customer = data;
          this.cd.detectChanges();
        });
       this.getProductList();
    }
  }

  removePopup(billinAccount: BillingAccount) {
    this.billingAccountToDelete = billinAccount;

    console.log(billinAccount);
    this.messageService.add({
      key: 'c',
      sticky: true,
      severity: 'warn',
      data: { acc: this.billingAccountToDelete },
      detail: 'Are you sure you want to delete?',
    });
  }

  remove() {
    this.customerService
      .removeBillingAccount(this.billingAccountToDelete, this.customer)
      .subscribe((data) => {
        this.onBillingAccountDelete.emit(this.billingAccountToDelete);
        this.getCustomerById();
      });
  }

  updateBillingAccount(billingAccount: BillingAccount) {
    this.router.navigateByUrl(
      `/dashboard/customers/${this.customerId}/customer-bill/update/${billingAccount.id}`
    );
  }

  getProductList() {
    this.billingAccount?.orders?.forEach((order) => {
      order?.offers?.forEach((offer) => {
        offer?.products?.forEach((product) => {
          this.product = product;
        });
      });
    });
  }

  removeProductPopup(product: Product) {
    this.productToDelete = product;
    this.messageService.add({
      key: 'c',
      severity: 'warn',
      detail: 'Are you sure you want to delete?',
    });
  }

  removeProduct() {
    let newBillingAccount: BillingAccount[] = [];
    if (this.customer.billingAccounts)
      newBillingAccount = this.customer.billingAccounts;
    newBillingAccount.forEach((acc) => {
      acc.orders.forEach((order) => {
        order.offers?.forEach((off) => {
          off.products = off.products.filter(
            (p) => p.id != this.productToDelete.id
          );
        });
      });
    });
    const newCustomer: Customer = {
      ...this.customer,
    };
    newCustomer.billingAccounts = newBillingAccount;
    this.customerService.removeProduct(newCustomer).subscribe((data) => {
      this.getCustomerById();
    });
  }
}
