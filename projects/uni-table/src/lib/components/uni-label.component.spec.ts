import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniLabelComponent } from './uni-label.component';

describe('UniLabelComponent', () => {
  let component: UniLabelComponent;
  let fixture: ComponentFixture<UniLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniLabelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UniLabelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the key if no translation is available', () => {
    fixture.componentRef.setInput('key', 'Test Label');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test Label');
  });
});
