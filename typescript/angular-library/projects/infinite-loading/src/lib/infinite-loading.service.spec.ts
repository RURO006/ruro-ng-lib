import { TestBed } from '@angular/core/testing';

import { InfiniteLoadingService } from './infinite-loading.service';

describe('InfiniteLoadingService', () => {
  let service: InfiniteLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfiniteLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
