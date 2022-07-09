import { TestBed } from '@angular/core/testing';

import { Blockchain3Service } from './blockchain3.service';

describe('Blockchain3Service', () => {
  let service: Blockchain3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Blockchain3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
