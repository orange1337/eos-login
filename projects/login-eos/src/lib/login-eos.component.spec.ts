import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginEOSComponent } from './login-eos.component';

describe('LoginEOSComponent', () => {
  let component: LoginEOSComponent;
  let fixture: ComponentFixture<LoginEOSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginEOSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginEOSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
