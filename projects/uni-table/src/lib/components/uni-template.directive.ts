import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[uniTemplate]',
  standalone: true,
})
export class UniTemplateDirective {
  name = input.required<string>({ alias: 'uniTemplate' });

  constructor(public template: TemplateRef<any>) {}
}