import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { OrgModule } from './org/org.module';
import { CreditsModule } from './credits/credits.module';
import { BillingModule } from './billing/billing.module';
import { GenerationModule } from './generation/generation.module';
import { HealthModule } from './health/health.module';
import { MediaController } from './media/media.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: Number(process.env.RATE_LIMIT_TTL_MS || 60_000),
        limit: Number(process.env.RATE_LIMIT_MAX || 120),
      },
    ]),
    CommonModule,
    HealthModule,
    AuthModule,
    OrgModule,
    CreditsModule,
    BillingModule,
    GenerationModule,
  ],
  controllers: [MediaController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
