import { Directive, HostListener, Input, OnChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

export enum SortOrder {
  ASC,
  DESC
}

@Directive({
  selector: '[tableColumnSort]',
  standalone: true
})
export class TableColumnSortDirective implements OnChanges {
  @Input() public tableColumnSort!: FormArray<FormGroup>;
  @Input() public targetColumn!: string;
  private sortOrder: SortOrder | null = null;

  constructor() { }

  ngOnChanges() {
    console.log(this.tableColumnSort);
  }

  @HostListener('click', [])
  onClicked() {
    this.updateSortOrderValue();

    this.tableColumnSort.controls = [...this.tableColumnSort.controls.sort((a, b) => {
      switch(this.sortOrder) {
        case SortOrder.ASC:
          return this.sortAsc(a, b);
          
        case SortOrder.DESC: 
          return this.sortDesc(a, b);
        
        default:
          return a.value.position - b.value.position;
      }
    })];
  }

  sortAsc(a: any, b: any) {
    if(typeof b.value[this.targetColumn] === 'string') {
      return a.value[this.targetColumn].localeCompare(b.value[this.targetColumn]);
    }

    return b.value.id - a.value.id;

    
  }

  sortDesc(a: any, b: any) {
    if(typeof a.value[this.targetColumn] === 'string') {
      return b.value[this.targetColumn].localeCompare(a.value[this.targetColumn]);
    }

    return a.value.id - b.value.id;
  }

  private updateSortOrderValue() {
    switch(this.sortOrder) {
      case SortOrder.ASC:
        this.sortOrder = SortOrder.DESC;
        break;
        
      case SortOrder.DESC: 
      this.sortOrder = null;
        break;
      
      default:
        this.sortOrder = SortOrder.ASC;
    }
  }
}
