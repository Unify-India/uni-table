import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[uniTemplate]',
  standalone: true,
})
export class UniTemplateDirective {
  @Input('uniTemplate') name!: string;

  constructor(public template: TemplateRef<any>) {}
}
