import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { Constants } from 'src/utils/constants';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should allow access to bypass URLs', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          url: Constants.BY_PASS_URLS[0], // Use the first bypass URL
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should call super.canActivate for non-bypass URLs', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          url: '/some-protected-route', // Non-bypass URL
        }),
      }),
    } as ExecutionContext;

    const superSpy = jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockReturnValue(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(superSpy).toHaveBeenCalled();
  });
});