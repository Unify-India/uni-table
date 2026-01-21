import { TestBed } from '@angular/core/testing';

import { UniTableService } from './uni-table.service';

describe('UniTableService', () => {
  let service: UniTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
