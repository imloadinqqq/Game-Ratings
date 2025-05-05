import { TestBed } from '@angular/core/testing';

import { CreateuserService } from './createuser.service';

describe('CreateuserService', () => {
  let service: CreateuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
