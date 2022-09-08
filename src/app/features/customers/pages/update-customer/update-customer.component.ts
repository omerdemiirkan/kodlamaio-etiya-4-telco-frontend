import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Customer } from '../../models/customer';
import { CustomersService } from '../../services/customer/customers.service';

@Component({
  templateUrl: './update-customer.component.html',
  styleUrls: ['./update-customer.component.css'],
})
export class UpdateCustomerComponent implements OnInit {
  updateCustomerForm!: FormGroup;
  selectedCustomerId!: number;
  customer!: Customer;
  isShow: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomersService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getCustomerById();
  }

  createFormUpdateCustomer() {
    this.updateCustomerForm = this.formBuilder.group({
      firstName: [
        this.customer.firstName,
        [Validators.required, Validators.maxLength(50)],
      ],
      middleName: [this.customer.middleName, [Validators.maxLength(50)]],
      lastName: [
        this.customer.lastName,
        [Validators.required, Validators.maxLength(50)],
      ],
      birthDate: [this.customer.birthDate, Validators.required],
      gender: [this.customer.gender, Validators.required],
      fatherName: [this.customer.fatherName, [Validators.maxLength(50)]],
      motherName: [this.customer.motherName, [Validators.maxLength(50)]],
      nationalityId: [
        this.customer.nationalityId,
        [Validators.pattern('^[0-9]{11}$'), Validators.required],
      ],
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
          this.createFormUpdateCustomer();
        });
    }
  }

  updateCustomer() {
    this.isShow = false;
    const customer: Customer = Object.assign(
      { id: this.customer.id },
      this.updateCustomerForm.value
    );
    this.customerService
      .updateDemographicInfo(customer, this.customer)
      .subscribe(() => {
        this.router.navigateByUrl(
          `/dashboard/customers/customer-info/${customer.id}`
        );
      });
  }

  checkInvalid() {
    if (this.updateCustomerForm.invalid) {
      this.isShow = true;

      return;
    }
    if (
      this.updateCustomerForm.value.nationalityId ===
      this.customer.nationalityId
    )
      this.updateCustomer();
    else this.checkTcNum(this.updateCustomerForm.value.nationalityId);
  }
  checkTcNum(id: number) {
    this.customerService.getList().subscribe((response) => {
      let matchCustomer = response.find((item) => {
        return item.nationalityId == id;
      });
      if (matchCustomer) {
        this.messageService.add({
          detail: 'Error created',
          severity: 'danger',
          summary: 'Error',
          key: 'etiya-custom',
        });
      } else this.updateCustomer();
    });
  }
  update() {
    this.checkInvalid();
  }
  isNumber(event: any): boolean {
    console.log(event);
    const pattern = /[0-9]/;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);
    if (pattern.test(char)) return true;

    event.preventDefault();
    return false;
  }

  previousPage() {
    this.router.navigateByUrl(
      `/dashboard/customers/customer-info/${this.selectedCustomerId}`
    );
  }
}
