import { TestBed } from '@angular/core/testing';

import { BlockchainSDKService } from './blockchain-sdk.service';

describe('BlockchainSDKService', () => {
  let service: BlockchainSDKService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlockchainSDKService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
