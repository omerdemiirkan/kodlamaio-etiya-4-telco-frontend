import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer } from '../../models/customer';
import { CustomersService } from '../../services/customer/customers.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { formatDate } from '@angular/common';

@Component({
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css'],
})
export class CreateCustomerComponent implements OnInit {
  profileForm!: FormGroup;
  createCustomerModel$!: Observable<Customer>;
  customer!: Customer;
  isShow: boolean = false;
  under18: Boolean = false;
  futureDate: Boolean = false;

  today: Date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomersService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.createCustomerModel$ = this.customerService.customerToAddModel$;
  }

  ngOnInit(): void {
    this.createCustomerModel$.subscribe((state) => {
      this.customer = state;
      this.createFormAddCustomer();
    });
  }

  createFormAddCustomer() {

 
    let bDate = new Date();
    if (this.customer.birthDate) {
      bDate = new Date(this.customer.birthDate);
    }


    this.profileForm = this.formBuilder.group({
      firstName: [this.customer.firstName, Validators.required],
      middleName: [this.customer.middleName],
      lastName: [this.customer.lastName, Validators.required],
      birthDate: [this.customer.birthDate, Validators.required,],
      gender: [this.customer.gender ?? '', Validators.required],
      fatherName: [this.customer.fatherName],
      motherName: [this.customer.motherName],
      nationalityId: [
        this.customer.nationalityId,
        [Validators.pattern('^[0-9]{11}$'), Validators.required],
      ],
    });
  }

  getCustomers(id: number) {
    this.customerService.getList().subscribe((response) => {
      let matchCustomer = response.find((item) => {
        return item.nationalityId == id;
      });
      if (matchCustomer) {
        this.messageService.add({
          detail: 'A customer is already exist with this Nationality ID',
          severity: 'warn',
          summary: 'Warning',
          key: 'okey',
        });
      } else {
        this.customerService.setDemographicInfoToStore(this.profileForm.value);
        this.router.navigateByUrl('/dashboard/customers/list-address-info');
      }
    });
  }
  goNextPage() {
    if (this.profileForm.valid) {
      this.isShow = false;
      this.getCustomers(this.profileForm.value.nationalityId);
    } else {
      this.isShow = true;
      let date = new Date(this.profileForm.get('birthDate')?.value);
      let age = this.today.getFullYear() - date.getFullYear();
      if (age < 18) {
        this.under18 = true;
        return;
      } else {
        this.under18 = false;
      }
    }
  }
  
  isValid(event: any): boolean {
    console.log(event);
    const pattern = /[0-9]/;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);
    if (pattern.test(char)) return true;

    event.preventDefault();
    return false;
  }



  onDateChange(event: any) {
    let date = new Date(event.target.value);
    if (date.getFullYear() > this.today.getFullYear()) {
      this.profileForm.get('birthDate')?.setValue('');
      this.futureDate = true;
    } else {
      this.futureDate = false;
    }
  }
}
