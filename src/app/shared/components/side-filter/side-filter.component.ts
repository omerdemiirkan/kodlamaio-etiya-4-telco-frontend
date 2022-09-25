import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from 'src/app/features/customers/services/customer/customers.service';

@Component({
  selector: 'app-side-filter',
  templateUrl: './side-filter.component.html',
  styleUrls: ['./side-filter.component.css'],
})
export class SideFilterComponent implements OnInit {
  @Input() filterTitle!: string;
  searchForm!: FormGroup;
  @Output() filteredData: any = new EventEmitter();

  public fixedNumber!: string;


  constructor(
    private formBuilder: FormBuilder,
    private customersService: CustomersService
  ) {}

  ngOnInit(): void {
    this.createSearchForm();
  }

  createSearchForm(): void {
    this.searchForm = this.formBuilder.group({
      nationalityId: [''],
      customerId: [''],
      accountNumber: [''],
      gsmNumber: [null,],
      firstName: [''],
      lastName: [''],
      orderNumber: [''],
    });
  }

  search() {
    let nationalityId = parseInt(this.searchForm.value.nationalityId);
    let newSearchForm = {
      ...this.searchForm.value,
      nationalityId: nationalityId,
    };
    if (this.searchForm.get('gsmNumber')?.value == '5') {
      newSearchForm = {
        ...newSearchForm,
        gsmNumber: '',
      };
    }
    console.log(nationalityId);
    this.customersService.getListByFilter(newSearchForm).subscribe((data) => {
      this.filteredData.emit(data);
    });
  }
  clear() {
    this.createSearchForm();
  }

  public onChange(value: string, inputElem: HTMLInputElement) {
    this.fixedNumber = value === '' ? '5' : value;
    inputElem.value = this.fixedNumber;
  }

  isNumber(event: any): boolean {
    console.log(event.target.value);
    const pattern = /[0-9]/;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);
    if (pattern.test(char)) return true;

    event.preventDefault();
    return false;
  }
}
