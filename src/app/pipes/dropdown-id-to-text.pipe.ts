import { Pipe, PipeTransform } from '@angular/core';
import { DROP_DOWN_OPTIONS } from '../constants/drop-down';

@Pipe({
  name: 'dropdownIdToText',
  standalone: true
})
export class DropdownIdToTextPipe implements PipeTransform {
  transform(id: number): unknown {
    return DROP_DOWN_OPTIONS.find((item) => item.id == id)?.text;
  }

}
