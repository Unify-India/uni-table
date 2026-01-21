import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniTableComponent } from './uni-table.component';

describe('UniTableComponent', () => {
  let component: UniTableComponent;
  let fixture: ComponentFixture<UniTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UniTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});