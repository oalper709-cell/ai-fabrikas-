import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { checkoutSchema, PLANS } from '@ai-fabrikasi/shared';
import { BillingService } from './billing.service';
import { CreditsService } from '../credits/credits.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly creditsService: CreditsService
  ) {}

  @Get('plans')
  listPlans() {
    return { success: true, data: this.billingService.listPlans() };
  }

  @Get('usage')
  @UseGuards(AuthGuard)
  async usage(@CurrentUser() user: { orgId: string }) {
    const balance = await this.creditsService.getBalance(user.orgId);
    const ledger = await this.creditsService.listLedger(user.orgId);
    const plan = PLANS[(balance.plan as keyof typeof PLANS) || 'FREE'] || PLANS.FREE;
    return {
      success: true,
      data: {
        ...balance,
        monthlyCredits: plan.monthlyCredits,
        ledger,
      },
    };
  }

  @Post('checkout')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('OWNER')
  async checkout(
    @CurrentUser() user: { userId: string; orgId: string },
    @Body() body: unknown
  ) {
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('Geçersiz plan');
    const data = await this.billingService.createCheckout(
      user.orgId,
      user.userId,
      parsed.data.plan
    );
    return { success: true, data };
  }

  /** Stripe webhook — raw body required for signature verification. */
  @Post('webhooks/stripe')
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string | undefined
  ) {
    const raw =
      req.rawBody ||
      (Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {})));
    const data = await this.billingService.handleWebhook(raw, signature);
    return { success: true, data };
  }
}
