import { TestBed } from '@angular/core/testing';

import { Blockchain2Service } from './blockchain2.service';

describe('Blockchain2Service', () => {
  let service: Blockchain2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Blockchain2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
