import { Component, Input, OnInit } from '@angular/core';
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
  customer!: Customer;
  billingAccountToDelete!: BillingAccount;

  product!: Product;
  productToDelete!: Product;

  constructor(
    private messageService: MessageService,
    private customerService: CustomersService,
    private router: Router
  ) {}

  
  ngOnInit(): void {
    this.getCustomerById();
    
    this.messageService.clearObserver.subscribe((data) => {
      if (data == 'r') {
        this.messageService.clear();
      } else if (data == 'c') {
        if (
          this.billingAccountToDelete?.orders &&
          this.billingAccountToDelete?.orders?.length > 0
        ) 
        {
          this.messageService.clear();
          this.messageService.add({
            key: 'offer',
            severity: 'warn',
            detail:
              'There is a product belonging to the account, this account cannot be deleted',
          });
          setTimeout(() => {
            this.messageService.clear();
          }, 3000);
        } else {
          this.messageService.clear();
          this.messageService.add({
            key: 'offer',
            severity: 'warn',
            detail: 'Customer account deleted successfully',
          });
          setTimeout(() => {
            this.messageService.clear();
          }, 3000);
          this.remove();
        }
        
      }
    });
  }

  productDetail(billingAccount: BillingAccount, offer: Offer) {
    if (offer.type.typeName == 'campaign') {
      let cnAddress = billingAccount.addresses.toString();
      let cnProdOfferId = offer.id.toString();
      let cnProdOfferName = offer.name;
      let cnCampaignId = offer.type.id.toString();
      this.messageService.add({
        key: 'okey',
        sticky: true,
        severity: 'warn',
        detail:
          'ProdOfferId:' +
          cnProdOfferId +
          '                ' +
          'ProdOfferName:' +
          cnProdOfferName +
          '   ' +
          'CampaignId' +
          cnCampaignId,
      });
    } else if (offer.type.typeName == 'catalog') {
      let cgAddress = billingAccount.addresses;
      let cgProdOfferId = offer.id;
      let cgProdOfferName = offer.name;
      this.messageService.add({
        key: 'okey',
        sticky: true,
        severity: 'warn',
        detail:
          'ProdOfferId:' +
          cgProdOfferId +
          '                ' +
          'ProdOfferName:' +
          cgProdOfferName +
          '   ',
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
        });
      // this.getProductList();
    }
  }

  removePopup(billinAccount: BillingAccount) {
    this.billingAccountToDelete = billinAccount;

    console.log(billinAccount);
    this.messageService.add({
      key: 'c',
      sticky: true,
      severity: 'warn',
      detail: 'Are you sure you want to delete?',
    });
  }

  remove() {
    this.customerService
      .removeBillingAccount(this.billingAccountToDelete, this.customer)
      .subscribe((data) => {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      });
  }

  updateBillingAccount(billingAccount: BillingAccount) {
    this.router.navigateByUrl(
      `/dashboard/customers/${this.customerId}/customer-bill/update/${billingAccount.id}`
    );
  }

  // getProductList() {
  //   this.billingAccount?.orders?.forEach((order) => {
  //     order?.offers?.forEach((offer) => {
  //       offer?.products?.forEach((product) => {
  //         this.product = product;
  //       });
  //     });
  //   });
  // }

  removeProductPopup(product: Product) {
    this.productToDelete = product;
    this.messageService.add({
      key: 'c',
      severity: 'warn',
      detail: 'Are you sure you want to delete?',
    });
  }

  removeProduct() {
    console.log(this.customer);
    console.log(this.product);

    this.customerService
      .removeProduct(this.customer, this.productToDelete)
      .subscribe((data) => {
        console.log(data);
        this.messageService.add({
          key: 'c',
          sticky: true,
          severity: 'warn',
          detail: 'Are you sure you want to delete?',
        });

        this.getCustomerById();
      });

    console.log(this.customer);
    console.log(this.product);
  }
}
