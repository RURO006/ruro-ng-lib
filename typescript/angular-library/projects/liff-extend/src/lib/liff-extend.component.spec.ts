import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiffExtendComponent } from './liff-extend.component';

describe('LiffExtendComponent', () => {
  let component: LiffExtendComponent;
  let fixture: ComponentFixture<LiffExtendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiffExtendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiffExtendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
