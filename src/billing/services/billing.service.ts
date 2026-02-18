import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../database/entities/Subscription.entity';
import { SubscriptionStatus, SubscriptionPlan } from '../../database/entities/enums/subscription.enum';
import { SubscriptionProvider } from '../../database/entities/enums/subscription.enum';
import { StripeService } from './stripe.service';

/**
 * Billing Service (Orchestrator)
 */
@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        private readonly stripeService: StripeService,
    ) {}

    /**
     * Get subscription by tenant
     */
    async getSubscription(tenantId: string): Promise<Subscription | null> {
        return this.subscriptionRepository.findOne({
            where: { tenantId },
        });
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(tenantId: string, atPeriodEnd: boolean): Promise<void> {
        const subscription = await this.getSubscription(tenantId);

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (subscription.provider === 'stripe' && subscription.subscriptionExternalId) {
            await this.stripeService.cancelSubscription(
                subscription.subscriptionExternalId,
                atPeriodEnd
            );
        }

        // Update local status
        if (!atPeriodEnd) {
            await this.subscriptionRepository.update(
                { id: subscription.id },
                {
                    status: SubscriptionStatus.CANCELED,
                    canceledAt: new Date(),
                }
            );
        } else {
            await this.subscriptionRepository.update(
                { id: subscription.id },
                {
                    cancelAtPeriodEnd: true,
                }
            );
        }
    }

    /**
     * Resume subscription
     */
    async resumeSubscription(tenantId: string, newPlan?: SubscriptionPlan): Promise<void> {
        const subscription = await this.getSubscription(tenantId);

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (subscription.provider === 'stripe' && subscription.subscriptionExternalId) {
            await this.stripeService.resumeSubscription(subscription.subscriptionExternalId);

            if (newPlan) {
                await this.stripeService.updateSubscriptionPlan(
                    subscription.subscriptionExternalId,
                    newPlan
                );
            }
        }

        // Update local status
        await this.subscriptionRepository.update(
            { id: subscription.id },
            {
                status: SubscriptionStatus.ACTIVE,
                plan: newPlan || subscription.plan,
                cancelAtPeriodEnd: false,
                canceledAt: undefined,
            }
        );
    }

    /**
     * Get invoices
     */
    async getInvoices(tenantId: string): Promise<any[]> {
        const subscription = await this.getSubscription(tenantId);

        if (!subscription) {
            return [];
        }

        if (subscription.provider === 'stripe' && subscription.externalId) {
            // TODO: Get invoices from Stripe
            return [];
        }

        return [];
    }

    /**
     * Get payment methods
     */
    async getPaymentMethods(tenantId: string): Promise<any[]> {
        const subscription = await this.getSubscription(tenantId);

        if (!subscription) {
            return [];
        }

        if (subscription.provider === 'stripe' && subscription.externalId) {
            // TODO: Get payment methods from Stripe
            return [];
        }

        return [];
    }

    /**
     * Update subscription from webhook
     */
    async updateSubscriptionFromWebhook(
        externalId: string,
        provider: SubscriptionProvider,
        data: {
            status?: SubscriptionStatus;
            plan?: SubscriptionPlan;
            currentPeriodEndAt?: Date;
            trialEndAt?: Date;
            cancelAtPeriodEnd?: boolean;
            canceledAt?: Date;
            amountCents?: number;
            currency?: string;
        },
    ): Promise<void> {
        await this.subscriptionRepository.update(
            { subscriptionExternalId: externalId, provider },
            {
                ...data,
                lastSyncedAt: new Date(),
            }
        );
    }

    /**
     * Create subscription from webhook
     */
    async createSubscriptionFromWebhook(
        tenantId: string,
        externalId: string,
        provider: SubscriptionProvider,
        data: {
            plan: SubscriptionPlan;
            status: SubscriptionStatus;
            trialStartAt?: Date;
            trialEndAt?: Date;
            currentPeriodStartAt?: Date;
            currentPeriodEndAt?: Date;
            amountCents?: number;
            currency?: string;
        },
    ): Promise<void> {
        await this.subscriptionRepository.save({
            tenantId,
            provider,
            externalId,
            subscriptionExternalId: externalId,
            ...data,
            lastSyncedAt: new Date(),
        });
    }
}
