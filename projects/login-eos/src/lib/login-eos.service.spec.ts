import { TestBed } from '@angular/core/testing';

import { LoginEOSService } from './login-eos.service';

describe('LoginEOSService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoginEOSService = TestBed.get(LoginEOSService);
    expect(service).toBeTruthy();
  });
});
