import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteLoadingComponent } from './infinite-loading.component';

describe('InfiniteLoadingComponent', () => {
  let component: InfiniteLoadingComponent;
  let fixture: ComponentFixture<InfiniteLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfiniteLoadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfiniteLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
