import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Customer } from '../../models/customer';
import { CustomersService } from '../../services/customer/customers.service';

@Component({
  selector: 'app-add-contact-medium',
  templateUrl: './add-contact-medium.component.html',
  styleUrls: ['./add-contact-medium.component.css'],
})
export class AddContactMediumComponent implements OnInit {
  contactForm!: FormGroup;
  customer!: Customer;
  isShow:Boolean=false
  displayBasic!: boolean;

  constructor(
    private customersService: CustomersService,
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.customersService.customerToAddModel$.subscribe((state) => {
      this.customer = state;
      this.createFormContactMedium();
    });
  }
  createFormContactMedium() {
    this.contactForm = this.formBuilder.group({
      email: [this.customer.contactMedium?.email, [Validators.email,Validators.required]],
      homePhone: [this.customer.contactMedium?.homePhone, Validators.required],
      mobilePhone: [
        this.customer.contactMedium?.mobilePhone,
        [Validators.pattern('^[0-9]{11}$'),Validators.required],
      ],
      fax: [this.customer.contactMedium?.fax, Validators.required],
    });
  }

  goToPreviousPage() {
    this.saveContactMediumToStore();
    this.router.navigateByUrl('/dashboard/customers/list-address-info');
  }

  saveContactMediumToStore() {
    this.customersService.setContactMediumInfoToStore(this.contactForm.value);
  }

  Save() {
    if (this.contactForm.valid) {
      this.isShow = false
      this.saveCustomer()
    }
    else{
      this.isShow = true
      this.displayBasic = true;
    }
  }

  saveCustomer() {
    this.saveContactMediumToStore();
    this.customersService.add(this.customer).subscribe({
      next: (data) => {
        this.messageService.add({
          detail: 'Sucsessfully added',
          severity: 'success',
          summary: 'Add',
          key: 'etiya-custom',
        });
        this.router.navigateByUrl('/dashboard/customers/customer-dashboard');
      },
      error: (err) => {
        this.messageService.add({
          detail: 'Error created',
          severity: 'danger',
          summary: 'Error',
          key: 'etiya-custom',
        });
      },
    });
  }
  isNumber(event: any): boolean {
    console.log(event);
    const pattern = /[0-9]/;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);
    if (pattern.test(char)) return true;

    event.preventDefault();
    return false;
  }



}
