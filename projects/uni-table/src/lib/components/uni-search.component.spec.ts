import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniSearchComponent } from './uni-search.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('UniSearchComponent', () => {
  let component: UniSearchComponent;
  let fixture: ComponentFixture<UniSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniSearchComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UniSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searchTermChange on input', () => {
    spyOn(component.searchTermChange, 'emit');
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.searchTermChange.emit).toHaveBeenCalledWith('test');
  });

  it('should display the correct placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Custom Placeholder');
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.placeholder).toBe('Custom Placeholder');
  });
});
