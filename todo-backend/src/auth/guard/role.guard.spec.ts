import { ExecutionContext } from '@nestjs/common';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  it('should allow access if roles match', () => {
    const guard = new RoleGuard('ADMIN');
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'ADMIN' }, // Matching role
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if roles do not match', () => {
    const guard = new RoleGuard('ADMIN');
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'USER' }, // Non-matching role
        }),
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });
});