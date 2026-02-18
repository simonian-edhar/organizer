import { Controller, Get } from '@nestjs/common';

/**
 * Health check endpoint for load balancers and Docker HEALTHCHECK
 */
@Controller()
export class HealthController {
  @Get('health')
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
