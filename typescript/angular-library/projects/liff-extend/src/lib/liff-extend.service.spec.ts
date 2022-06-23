import { TestBed } from '@angular/core/testing';

import { LiffExtendService } from './liff-extend.service';

describe('LiffExtendService', () => {
  let service: LiffExtendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiffExtendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
