import { TestBed } from '@angular/core/testing';

import { GameviewService } from './gameview.service';

describe('GameviewService', () => {
  let service: GameviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
