import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, inject, Input, Output, Renderer2 } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

export enum SortOrder {
  ASC,
  DESC
}

@Directive({
  selector: '[userFormTableColumnSort]',
  standalone: true,
  exportAs: "userFormTableColumnSort"
})
export class UserFormTableColumnSortDirective implements AfterViewInit {
  elementRef = inject(ElementRef);
  renderer2 = inject(Renderer2);

  @Output() onSort = new EventEmitter<SortOrder | null>();
  @Input() userFormTableColumnSort!: FormArray<FormGroup>;
  @Input() userFormColumn!: string;

  private sortOrder: SortOrder | null = null;
  private iconElement!: HTMLLIElement;

  ngAfterViewInit(): void {
    this.iconElement = this.renderer2.createElement('i');
    this.renderer2.addClass(this.elementRef.nativeElement, 'cursor-pointer');
    this.elementRef.nativeElement.append(this.iconElement);
    this.setIcon();
  }

  @HostListener('click', [])
  onClicked() {
    this.updateSortOrderValue();
    this.setIcon();

    this.userFormTableColumnSort.controls = [...this.userFormTableColumnSort.controls.sort((a, b) => {
      switch (this.sortOrder) {
        case SortOrder.ASC:
          return this.sortAsc(a, b);

        case SortOrder.DESC:
          return this.sortDesc(a, b);

        default:
          return a.value.position - b.value.position;
      }
    })];

    this.onSort.emit(this.sortOrder);
  }

  reset() {
    this.sortOrder = null;
    this.setIcon();
  }

  private sortAsc(a: any, b: any) {
    if (typeof b.value[this.userFormColumn] === 'string') {
      return a.value[this.userFormColumn].localeCompare(b.value[this.userFormColumn]);
    }

    return b.value.id - a.value.id;


  }

  private sortDesc(a: any, b: any) {
    if (typeof a.value[this.userFormColumn] === 'string') {
      return b.value[this.userFormColumn].localeCompare(a.value[this.userFormColumn]);
    }

    return a.value.id - b.value.id;
  }

  private updateSortOrderValue() {
    switch (this.sortOrder) {
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

  private setIcon() {
    this.renderer2.setAttribute(this.iconElement, 'class', '');

    switch (this.sortOrder) {
      case SortOrder.ASC:
        this.renderer2.addClass(this.iconElement, 'ri-arrow-up-s-fill');
        break;

      case SortOrder.DESC:
        this.renderer2.addClass(this.iconElement, 'ri-arrow-down-s-fill');
        break;

      default:
        this.renderer2.addClass(this.iconElement, 'ri-expand-up-down-fill');
    }
  }
}
