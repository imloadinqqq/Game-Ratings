import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameviewComponent } from './gameview.component';

describe('GameviewComponent', () => {
  let component: GameviewComponent;
  let fixture: ComponentFixture<GameviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
