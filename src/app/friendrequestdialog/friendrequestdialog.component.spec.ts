import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendrequestdialogComponent } from './friendrequestdialog.component';

describe('FriendrequestdialogComponent', () => {
  let component: FriendrequestdialogComponent;
  let fixture: ComponentFixture<FriendrequestdialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FriendrequestdialogComponent]
    });
    fixture = TestBed.createComponent(FriendrequestdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
