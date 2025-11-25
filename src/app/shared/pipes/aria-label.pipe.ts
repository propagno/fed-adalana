import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ariaLabel',
  standalone: true
})
export class AriaLabelPipe implements PipeTransform {
  transform(value: string, prefix: string = ''): string {
    if (!value) return '';
    return prefix ? `${prefix} ${value}` : value;
  }
}

