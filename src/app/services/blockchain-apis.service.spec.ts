import { TestBed } from '@angular/core/testing';

import { BlockchainApisService } from './blockchain-apis.service';

describe('BlockchainApisService', () => {
  let service: BlockchainApisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlockchainApisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
