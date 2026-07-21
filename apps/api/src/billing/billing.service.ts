import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { prisma } from '@ai-fabrikasi/db';
import { PLANS, PlanId } from '@ai-fabrikasi/shared';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class BillingService {
  constructor(private readonly creditsService: CreditsService) {}

  private getStripe(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new ServiceUnavailableException('Stripe yapılandırılmamış (STRIPE_SECRET_KEY)');
    }
    return new Stripe(key);
  }

  listPlans() {
    return Object.values(PLANS).map((plan) => ({
      ...plan,
      stripeConfigured: Boolean(
        plan.id === 'FREE'
          ? true
          : plan.id === 'STARTER'
            ? process.env.STRIPE_STARTER_PRICE_ID
            : process.env.STRIPE_PRO_PRICE_ID
      ),
    }));
  }

  async createCheckout(orgId: string, userId: string, plan: 'STARTER' | 'PRO') {
    const stripe = this.getStripe();
    const priceId =
      plan === 'STARTER'
        ? process.env.STRIPE_STARTER_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      throw new ServiceUnavailableException(`${plan} için STRIPE_*_PRICE_ID eksik`);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!user || !org) throw new NotFoundException('Kullanıcı veya organizasyon yok');

    let subscription = await prisma.subscription.findFirst({ where: { orgId } });
    let customerId = subscription?.stripeCustomerId ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: { orgId, userId },
      });
      customerId = customer.id;

      if (subscription) {
        subscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            orgId,
            stripeCustomerId: customerId,
            status: 'inactive',
          },
        });
      }
    }

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontend}/app/billing?success=1`,
      cancel_url: `${frontend}/app/billing?canceled=1`,
      metadata: { orgId, plan, userId },
      subscription_data: {
        metadata: { orgId, plan },
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    const stripe = this.getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET eksik');
    }
    if (!signature) throw new BadRequestException('Stripe-Signature yok');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Webhook imzası geçersiz');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;
        const plan = session.metadata?.plan as PlanId | undefined;
        if (orgId && (plan === 'STARTER' || plan === 'PRO')) {
          await this.activatePlan(
            orgId,
            plan,
            typeof session.subscription === 'string' ? session.subscription : null,
            typeof session.customer === 'string' ? session.customer : null
          );
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.orgId;
        if (!orgId) break;

        if (event.type === 'customer.subscription.deleted' || sub.status === 'canceled') {
          await this.activatePlan(
            orgId,
            'FREE',
            null,
            typeof sub.customer === 'string' ? sub.customer : null
          );
        } else if (sub.metadata?.plan === 'STARTER' || sub.metadata?.plan === 'PRO') {
          await this.activatePlan(
            orgId,
            sub.metadata.plan as 'STARTER' | 'PRO',
            sub.id,
            typeof sub.customer === 'string' ? sub.customer : null
          );
        }
        break;
      }
      default:
        break;
    }

    return { received: true };
  }

  private async activatePlan(
    orgId: string,
    plan: PlanId,
    stripeSubId: string | null,
    stripeCustomerId: string | null
  ) {
    const existing = await prisma.subscription.findFirst({ where: { orgId } });
    const status = plan === 'FREE' ? 'inactive' : 'active';

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          stripeCustomerId: stripeCustomerId || existing.stripeCustomerId,
          stripeSubId: stripeSubId || existing.stripeSubId,
          status,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          orgId,
          stripeCustomerId,
          stripeSubId,
          status,
        },
      });
    }

    await this.creditsService.setPlanAndRefreshCredits(
      orgId,
      plan,
      PLANS[plan].monthlyCredits
    );
  }
}
