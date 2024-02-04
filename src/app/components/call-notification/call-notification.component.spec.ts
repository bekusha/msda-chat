import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallNotificationComponent } from './call-notification.component';

describe('CallNotificationComponent', () => {
  let component: CallNotificationComponent;
  let fixture: ComponentFixture<CallNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CallNotificationComponent]
    });
    fixture = TestBed.createComponent(CallNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
