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
    this.messageService.clearObserver.subscribe((data) => {
      if (data == 'r') {
        this.messageService.clear();
      } else if (data == 'c') {
        if (this.productToDelete) {
          
          this.billingAccount.orders.forEach((order) => {
            order.offers?.forEach((offer) => {
              offer.products = offer.products.filter(
                (p) => p.id != this.productToDelete.id
                
              );
            });
          });
          this.removeProduct();
        }
        if (
          this.billingAccountToDelete?.orders &&
          this.billingAccountToDelete?.orders?.length > 0
        ) {
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
          this.remove();
          this.messageService.clear();
          this.messageService.add({
            key: 'offer',
            severity: 'warn',
            detail: 'Customer account deleted successfully',
          });
          setTimeout(() => {
            this.messageService.clear();
          }, 3000);
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
        detail:
          'Prod Offer Id: ' +
          campaignProdOfferId +
          '       ' +
          'Prod Offer Name: ' +
          campaignProdOfferName +
          '       ' +
          'Campaign Id: ' +
          campaignId +
          '       ' +
          campaignAddressDetail.city.name +
          '       ' +
          campaignAddressDetail.description +
          '       ',
      });
    } else if (offer.type.typeName == 'catalog') {
      let catalogProdOfferId = offer.id;
      let catalogProdOfferName = offer.name;
      let catalogAddressDetail: any = [];
      billingAccount.addresses.forEach((data) => (catalogAddressDetail = data));
      this.messageService.add({
        key: 'product-detail',
        sticky: true,
        severity: 'warn',
        detail:
          'ProdOfferId: ' +
          catalogProdOfferId +
          '         ' +
          'ProdOfferName: ' +
          catalogProdOfferName +
          '          ' +
          'Address Name: ' +
          catalogAddressDetail.city.name +
          '          ' +
          'Address Description: ' +
          catalogAddressDetail.description +
          '          ',
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

  // // getProductList() {
  // //   this.billingAccount?.orders?.forEach((order) => {
  // //     order?.offers?.forEach((offer) => {
  // //       offer?.products?.forEach((product) => {
  // //         this.product = product;
  // //       });
  // //     });
  // //   });
  // // }

  removeProductPopup(product: Product) {
    this.productToDelete = product;
    this.messageService.add({
      key: 'c',
      severity: 'warn',
      detail: 'Are you sure you want to delete?',
    });
  }

  removeProduct() {
    console.log('prodcgsgsgs' + JSON.stringify(this.productToDelete));
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

  }
}
