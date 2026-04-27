import { Component, ContentChildren, QueryList, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniTemplateDirective } from './uni-template.directive';

@Component({
  selector: 'test-wrapper',
  standalone: true,
  template: `<ng-content></ng-content>`
})
class TestWrapperComponent {
  @ContentChildren(UniTemplateDirective) templates!: QueryList<UniTemplateDirective>;
}

@Component({
  standalone: true,
  imports: [TestWrapperComponent, UniTemplateDirective],
  template: `
    <test-wrapper #wrapper>
      <ng-template uniTemplate="testHeader">Header</ng-template>
      <ng-template uniTemplate="testCell">Cell</ng-template>
    </test-wrapper>
  `
})
class TestHostComponent {
  @ViewChild('wrapper') wrapper!: TestWrapperComponent;
}

describe('UniTemplateDirective', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniTemplateDirective, TestHostComponent, TestWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should collect templates from content', () => {
    const templates = component.wrapper.templates.toArray();
    expect(templates.length).toBe(2);
    expect(templates[0].name).toBe('testHeader');
    expect(templates[1].name).toBe('testCell');
  });
});
