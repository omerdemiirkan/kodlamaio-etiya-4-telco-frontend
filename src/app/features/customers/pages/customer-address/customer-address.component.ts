import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Address } from '../../models/address';
import { Customer } from '../../models/customer';
import { CustomersService } from '../../services/customer/customers.service';

@Component({
  templateUrl: './customer-address.component.html',
  styleUrls: ['./customer-address.component.css'],
})
export class CustomerAddressComponent implements OnInit {
  
  selectedCustomerId!: number;
  customerAddress: Address[] = [];
  customer!: Customer;
  addressToDelete!: Address;

  constructor(
    private activatedRoute: ActivatedRoute,
    private customerService: CustomersService,
    private router: Router,
    private messageService:MessageService
  ) {}

  ngOnInit(): void {
    this.getCustomerById();
    this.messageService.clearObserver.subscribe((data) => {
      if (data == 'r') {
        this.messageService.clear();
      } else if (data == 'c') {
        this.messageService.clear();
        this.remove();
      }
    });
  }

  getCustomerById() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) this.selectedCustomerId = params['id'];
    });
    if (this.selectedCustomerId == undefined) {
      //toast
    } else {
      this.customerService
        .getCustomerById(this.selectedCustomerId)
        .subscribe((data) => {
          this.customer = data;
          this.customerAddress = []
          data.addresses?.forEach((adress) => {
            this.customerAddress.push(adress);
          });
        });
    }
  }

  addAddressBySelectedId() {
    this.router.navigateByUrl(
      `/dashboard/customers/${this.selectedCustomerId}/address/add`
    );
  }

  selectAddressId(addressId: number) {
    this.router.navigateByUrl(
      `/dashboard/customers/${this.selectedCustomerId}/address/update/${addressId}`
    );
  }

  removePopup(address: Address) {
    this.addressToDelete = address;
    this.messageService.add({
      key: 'c',
      severity: 'warn',
      detail: 'Are you sure you want to delete?',
    });
  }

  remove() {
    this.customerService
      .removeAddress(this.customer,this.addressToDelete)
      .subscribe((data) => {
        
        this.getCustomerById();
      });
  }
  handleConfigInput(event: any) {
    this.customer.addresses = this.customer.addresses?.map((adr) => {
      const newAddress = { ...adr, isMain: false };
      return newAddress;
    });
    let findAddress = this.customer.addresses?.find((adr) => {
      return adr.id == event.target.value;
    });
    findAddress!.isMain = true;
    this.customerService.update(this.customer).subscribe((data) => {
      this.getCustomerById()
    });
  }
}
