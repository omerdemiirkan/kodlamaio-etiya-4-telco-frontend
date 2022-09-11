import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CityService } from 'src/app/features/city/services/city/city.service';

import { Offer } from 'src/app/features/offers/models/offer';
import { OfferService } from 'src/app/features/offers/services/offer/offer.service';
import { OrderService } from 'src/app/features/orders/services/order/order.service';
import { ProductConfigDto } from 'src/app/features/products/models/productConfigDto';
import { Address } from '../../models/address';
import { BillingAccount } from '../../models/billingAccount';
import { City } from '../../models/city';
import { Customer } from '../../models/customer';
import { Product } from '../../models/product';
import { CustomersService } from '../../services/customer/customers.service';

@Component({
  templateUrl: './configuration-product.component.html',
  styleUrls: ['./configuration-product.component.css'],
})
export class ConfigurationProductComponent implements OnInit {
  basket!: Offer[];

  selectedCustomerId!: number;
  billingAccountId!: number;
  customer!: Customer;
  billingAccountList!: BillingAccount[];
  billingAdress: Address[] = [];
  isShown: boolean = false;
  isShownError: boolean = false;
  addressForm!: FormGroup;
  cityList!: City[];

  constructor(
    private offerService: OfferService,
    private activatedRoute: ActivatedRoute,
    private customersService: CustomersService,
    private orderService: OrderService,
    private formBuilder: FormBuilder,
    private cityService: CityService
  ) {}

  ngOnInit(): void {
    this.getParams();
    this.getCityList();
    this.listenBasket();
  }

  listenBasket() {
    this.offerService.basket$.subscribe((data) => {
      this.basket = [...data];
    });
  }

  isTypeProduct(product: Product, type: string): boolean {
    return product.name.toLowerCase().includes(type);
  }
  handleConfigInput(
    event: any,
    offer: Offer,
    product: Product,
    configurationKey: string
  ) {
    const productConfigDto: ProductConfigDto = {
      key: configurationKey,
      value: event.target.value,
    };

    this.offerService.changeConfigOfProductInBasketInStore(
      offer,
      product,
      productConfigDto
    );
    console.log(event.target.value);
  }
  getConfigValueOfProduct(
    offer: Offer,
    product: Product,
    configurationKey: string
  ): string {
    const findProduct: Product = offer.products.find(
      (p) => p.id === product.id
    ) as Product;
    if (
      findProduct.config == undefined ||
      findProduct.config[configurationKey] == undefined
    )
      return '';

    return findProduct.config[configurationKey];
  }
  getParams() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) this.selectedCustomerId = params['id'];
      if (params['billingAccountId'])
        this.billingAccountId = params['billingAccountId'];
      this.getCustomerById();
    });
  }

  getCustomerById() {
    if (this.selectedCustomerId == undefined) {
      //toast
    } else {
      this.customersService
        .getCustomerById(this.selectedCustomerId)
        .subscribe((data) => {
          this.billingAccountList = data.billingAccounts || [];
          this.billingAccountList?.forEach((bill) => {
            if (this.billingAccountId == bill.id) {
              bill.addresses.forEach((adr) => {
                this.billingAdress.push(adr);
              });
            }
          });
        });
      this.createAddressForm();
    }
  }
  isSelected(address: Address): boolean {
    if (this.billingAccountList === undefined) return false;
    return Boolean(
      this.billingAccountList.find((addressInList) =>
        addressInList.addresses.forEach((data) => {
          data == address;
        })
      )
    );
  }

  getAddressInfo(address: Address) {
    this.orderService.addAddressToOrderStore(address);
  }
  addOfferToOrder() {
    this.offerService.basket$.subscribe((basket) => {
      console.log('basket: ', basket);
      if (basket === undefined) return;
      this.orderService.addOfferToOrderStore([...basket]);
    });
  }

  createAddressForm() {
    this.addressForm = this.formBuilder.group({
      id: [Math.floor(Math.random() * 1000)],
      city: ['', Validators.required],
      street: ['', Validators.required],
      flatNumber: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  addNewAddressBtn() {
    this.isShown = true;
    this.createAddressForm();
  }

  getCityList() {
    this.cityService.getList().subscribe((data) => {
      this.cityList = data;
    });
  }

  addAddress() {
    if (this.addressForm.valid) {
      this.isShownError = false;
      const addressToAdd: Address = {
        ...this.addressForm.value,
        city: this.cityList.find(
          (city) => city.id == this.addressForm.value.city
        ),
      };
      this.billingAdress.push(addressToAdd);
      console.log(addressToAdd);
      this.isShown = false;
    } else {
      this.isShownError = true;
    }
  }
}