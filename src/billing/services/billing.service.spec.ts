import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';
import { WayForPayService } from './wayforpay.service';
import { Subscription } from '../../database/entities/Subscription.entity';
import { SubscriptionStatus, SubscriptionPlan, SubscriptionProvider } from '../../database/entities/enums/subscription.enum';

describe('BillingService', () => {
    let service: BillingService;
    let subscriptionRepository: jest.Mocked<Repository<Subscription>>;
    let stripeService: jest.Mocked<StripeService>;
    let wayForPayService: jest.Mocked<WayForPayService>;

    const mockTenantId = 'test-tenant-id';
    const mockSubscriptionId = 'test-subscription-id';
    const mockExternalId = 'ext_sub_123456';

    const mockSubscription: Subscription = {
        id: mockSubscriptionId,
        tenantId: mockTenantId,
        provider: SubscriptionProvider.STRIPE,
        externalId: 'cus_123',
        subscriptionExternalId: mockExternalId,
        plan: SubscriptionPlan.PROFESSIONAL,
        status: SubscriptionStatus.ACTIVE,
        trialStartAt: null,
        trialEndAt: null,
        currentPeriodStartAt: new Date(),
        currentPeriodEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        amountCents: 2999,
        currency: 'USD',
        lastSyncedAt: new Date(),
    } as Subscription;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BillingService,
                {
                    provide: getRepositoryToken(Subscription),
                    useValue: {
                        findOne: jest.fn(),
                        update: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: StripeService,
                    useValue: {
                        cancelSubscription: jest.fn(),
                        resumeSubscription: jest.fn(),
                        updateSubscriptionPlan: jest.fn(),
                        getInvoices: jest.fn(),
                        getPaymentMethods: jest.fn(),
                    },
                },
                {
                    provide: WayForPayService,
                    useValue: {
                        createPayment: jest.fn(),
                        verifyPayment: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BillingService>(BillingService);
        subscriptionRepository = module.get(getRepositoryToken(Subscription));
        stripeService = module.get(StripeService);
        wayForPayService = module.get(WayForPayService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSubscription', () => {
        it('should return subscription for tenant', async () => {
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);

            const result = await service.getSubscription(mockTenantId);

            expect(result).toEqual(mockSubscription);
            expect(subscriptionRepository.findOne).toHaveBeenCalledWith({
                where: { tenantId: mockTenantId },
            });
        });

        it('should return null if subscription not found', async () => {
            subscriptionRepository.findOne.mockResolvedValue(null);

            const result = await service.getSubscription(mockTenantId);

            expect(result).toBeNull();
        });
    });

    describe('cancelSubscription', () => {
        it('should cancel subscription immediately via Stripe', async () => {
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            stripeService.cancelSubscription.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({} as any);

            await service.cancelSubscription(mockTenantId, false);

            expect(stripeService.cancelSubscription).toHaveBeenCalledWith(mockExternalId, false);
            expect(subscriptionRepository.update).toHaveBeenCalledWith(
                { id: mockSubscriptionId },
                {
                    status: SubscriptionStatus.CANCELED,
                    canceledAt: expect.any(Date),
                }
            );
        });

        it('should cancel subscription at period end via Stripe', async () => {
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            stripeService.cancelSubscription.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({} as any);

            await service.cancelSubscription(mockTenantId, true);

            expect(stripeService.cancelSubscription).toHaveBeenCalledWith(mockExternalId, true);
            expect(subscriptionRepository.update).toHaveBeenCalledWith(
                { id: mockSubscriptionId },
                {
                    cancelAtPeriodEnd: true,
                }
            );
        });

        it('should handle subscription without Stripe external ID', async () => {
            const localSubscription = {
                ...mockSubscription,
                provider: SubscriptionProvider.WAYFORPAY,
                subscriptionExternalId: null,
            };
            subscriptionRepository.findOne.mockResolvedValue(localSubscription);
            subscriptionRepository.update.mockResolvedValue({} as any);

            await service.cancelSubscription(mockTenantId, false);

            expect(stripeService.cancelSubscription).not.toHaveBeenCalled();
            expect(subscriptionRepository.update).toHaveBeenCalled();
        });
    });

    describe('resumeSubscription', () => {
        it('should resume subscription via Stripe', async () => {
            const canceledSubscription = {
                ...mockSubscription,
                status: SubscriptionStatus.CANCELED,
                cancelAtPeriodEnd: true,
            };
            subscriptionRepository.findOne.mockResolvedValue(canceledSubscription);
            stripeService.resumeSubscription.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({} as any);

            await service.resumeSubscription(mockTenantId);

            expect(stripeService.resumeSubscription).toHaveBeenCalledWith(mockExternalId);
            expect(subscriptionRepository.update).toHaveBeenCalledWith(
                { id: mockSubscriptionId },
                {
                    status: SubscriptionStatus.ACTIVE,
                    plan: canceledSubscription.plan,
                    cancelAtPeriodEnd: false,
                    canceledAt: null,
                }
            );
        });

        it('should resume and upgrade subscription plan', async () => {
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            stripeService.resumeSubscription.mockResolvedValue();
            stripeService.updateSubscriptionPlan.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({} as any);

            await service.resumeSubscription(mockTenantId, SubscriptionPlan.ENTERPRISE);

            expect(stripeService.updateSubscriptionPlan).toHaveBeenCalledWith(
                mockExternalId,
                SubscriptionPlan.ENTERPRISE
            );
            expect(subscriptionRepository.update).toHaveBeenCalledWith(
                { id: mockSubscriptionId },
                {
                    status: SubscriptionStatus.ACTIVE,
                    plan: SubscriptionPlan.ENTERPRISE,
                    cancelAtPeriodEnd: false,
                    canceledAt: null,
                }
            );
        });
    });

    describe('getInvoices', () => {
        it('should return empty array for Stripe subscription', async () => {
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);

            const result = await service.getInvoices(mockTenantId);

            expect(result).toEqual([]);
        });

        it('should return empty array for non-Stripe subscription', async () => {
            const wayforpaySubscription = {
                ...mockSubscription,
                provider: SubscriptionProvider.WAYFORPAY,
            };
            subscriptionRepository.findOne.mockResolvedValue(wayforpaySubscription);

            const result = await service.getInvoices(mockTenantId);

            expect(result).toEqual([]);
        });
    });

    describe('getPaymentMethods', () => {
        it('should return empty array for Stripe subscription', async () => {
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);

            const result = await service.getPaymentMethods(mockTenantId);

            expect(result).toEqual([]);
        });
    });

    describe('updateSubscriptionFromWebhook', () => {
        it('should update subscription from webhook data', async () => {
            subscriptionRepository.update.mockResolvedValue({} as any);

            await service.updateSubscriptionFromWebhook(
                mockExternalId,
                SubscriptionProvider.STRIPE,
                {
                    status: SubscriptionStatus.ACTIVE,
                    plan: SubscriptionPlan.ENTERPRISE,
                    currentPeriodEndAt: new Date('2024-12-31'),
                    amountCents: 4999,
                    currency: 'USD',
                }
            );

            expect(subscriptionRepository.update).toHaveBeenCalledWith(
                { subscriptionExternalId: mockExternalId, provider: SubscriptionProvider.STRIPE },
                {
                    status: SubscriptionStatus.ACTIVE,
                    plan: SubscriptionPlan.ENTERPRISE,
                    currentPeriodEndAt: expect.any(Date),
                    amountCents: 4999,
                    currency: 'USD',
                    lastSyncedAt: expect.any(Date),
                }
            );
        });

        it('should update only provided fields', async () => {
            subscriptionRepository.update.mockResolvedValue({} as any);

            await service.updateSubscriptionFromWebhook(
                mockExternalId,
                SubscriptionProvider.STRIPE,
                {
                    status: SubscriptionStatus.PAST_DUE,
                }
            );

            expect(subscriptionRepository.update).toHaveBeenCalledWith(
                { subscriptionExternalId: mockExternalId, provider: SubscriptionProvider.STRIPE },
                {
                    status: SubscriptionStatus.PAST_DUE,
                    lastSyncedAt: expect.any(Date),
                }
            );
        });
    });

    describe('createSubscriptionFromWebhook', () => {
        it('should create subscription from webhook data', async () => {
            subscriptionRepository.save.mockResolvedValue({} as any);

            await service.createSubscriptionFromWebhook(
                mockTenantId,
                mockExternalId,
                SubscriptionProvider.STRIPE,
                {
                    plan: SubscriptionPlan.PROFESSIONAL,
                    status: SubscriptionStatus.ACTIVE,
                    trialStartAt: new Date(),
                    trialEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    currentPeriodStartAt: new Date(),
                    currentPeriodEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    amountCents: 2999,
                    currency: 'USD',
                }
            );

            expect(subscriptionRepository.save).toHaveBeenCalledWith({
                tenantId: mockTenantId,
                provider: SubscriptionProvider.STRIPE,
                externalId: mockExternalId,
                subscriptionExternalId: mockExternalId,
                plan: SubscriptionPlan.PROFESSIONAL,
                status: SubscriptionStatus.ACTIVE,
                trialStartAt: expect.any(Date),
                trialEndAt: expect.any(Date),
                currentPeriodStartAt: expect.any(Date),
                currentPeriodEndAt: expect.any(Date),
                amountCents: 2999,
                currency: 'USD',
                lastSyncedAt: expect.any(Date),
            });
        });

        it('should create subscription with minimal data', async () => {
            subscriptionRepository.save.mockResolvedValue({} as any);

            await service.createSubscriptionFromWebhook(
                mockTenantId,
                mockExternalId,
                SubscriptionProvider.WAYFORPAY,
                {
                    plan: SubscriptionPlan.BASIC,
                    status: SubscriptionStatus.TRIALING,
                }
            );

            expect(subscriptionRepository.save).toHaveBeenCalledWith({
                tenantId: mockTenantId,
                provider: SubscriptionProvider.WAYFORPAY,
                externalId: mockExternalId,
                subscriptionExternalId: mockExternalId,
                plan: SubscriptionPlan.BASIC,
                status: SubscriptionStatus.TRIALING,
                lastSyncedAt: expect.any(Date),
            });
        });
    });
});
