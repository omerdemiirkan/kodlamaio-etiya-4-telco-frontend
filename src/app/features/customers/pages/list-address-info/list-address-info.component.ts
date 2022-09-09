import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Address } from '../../models/address';
import { Customer } from '../../models/customer';
import { CustomersService } from '../../services/customer/customers.service';

@Component({
  selector: 'app-list-address-info',
  templateUrl: './list-address-info.component.html',
  styleUrls: ['./list-address-info.component.css'],
})
export class ListAddressInfoComponent implements OnInit {

  selectedCustomerId!: number;
  customerAddress: Address[] = [];
  customer!: Customer;
  addressToDelete!: Address;

  constructor(private customersService: CustomersService, private router: Router, private messageService: MessageService, private activatedRoute: ActivatedRoute) {}


    ngOnInit(): void {
      this.customersService.customerToAddModel$.subscribe((state) => {
        this.customer = state;
      });
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
        this.customersService
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

    selectAddressId(id: number) {
      let address = this.customer.addresses?.find((c) => c.id == id);
      this.router.navigateByUrl(`update-address-info/${address?.id}`);
    }
    removePopup(address: Address) {
      this.addressToDelete = address;
      this.messageService.add({
        key: 'c',
       
        severity: 'warn',
        detail: 'Are you sure to delete this address?',
      });
    }
    remove() {
      this.customersService
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
      this.customersService.update(this.customer).subscribe((data) => {
        this.getCustomerById()
      });
    }


}
