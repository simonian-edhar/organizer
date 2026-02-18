"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _typeorm = require("@nestjs/typeorm");
const _billingservice = require("./billing.service");
const _stripeservice = require("./stripe.service");
const _wayforpayservice = require("./wayforpay.service");
const _Subscriptionentity = require("../../database/entities/Subscription.entity");
const _subscriptionenum = require("../../database/entities/enums/subscription.enum");
describe('BillingService', ()=>{
    let service;
    let subscriptionRepository;
    let stripeService;
    let wayForPayService;
    const mockTenantId = 'test-tenant-id';
    const mockSubscriptionId = 'test-subscription-id';
    const mockExternalId = 'ext_sub_123456';
    const mockSubscription = {
        id: mockSubscriptionId,
        tenantId: mockTenantId,
        provider: _subscriptionenum.SubscriptionProvider.STRIPE,
        externalId: 'cus_123',
        subscriptionExternalId: mockExternalId,
        plan: _subscriptionenum.SubscriptionPlan.PROFESSIONAL,
        status: _subscriptionenum.SubscriptionStatus.ACTIVE,
        trialStartAt: null,
        trialEndAt: null,
        currentPeriodStartAt: new Date(),
        currentPeriodEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        canceledAt: null,
        amountCents: 2999,
        currency: 'USD',
        lastSyncedAt: new Date()
    };
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _billingservice.BillingService,
                {
                    provide: (0, _typeorm.getRepositoryToken)(_Subscriptionentity.Subscription),
                    useValue: {
                        findOne: jest.fn(),
                        update: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn()
                    }
                },
                {
                    provide: _stripeservice.StripeService,
                    useValue: {
                        cancelSubscription: jest.fn(),
                        resumeSubscription: jest.fn(),
                        updateSubscriptionPlan: jest.fn(),
                        getInvoices: jest.fn(),
                        getPaymentMethods: jest.fn()
                    }
                },
                {
                    provide: _wayforpayservice.WayForPayService,
                    useValue: {
                        createPayment: jest.fn(),
                        verifyPayment: jest.fn()
                    }
                }
            ]
        }).compile();
        service = module.get(_billingservice.BillingService);
        subscriptionRepository = module.get((0, _typeorm.getRepositoryToken)(_Subscriptionentity.Subscription));
        stripeService = module.get(_stripeservice.StripeService);
        wayForPayService = module.get(_wayforpayservice.WayForPayService);
    });
    afterEach(()=>{
        jest.clearAllMocks();
    });
    describe('getSubscription', ()=>{
        it('should return subscription for tenant', async ()=>{
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            const result = await service.getSubscription(mockTenantId);
            expect(result).toEqual(mockSubscription);
            expect(subscriptionRepository.findOne).toHaveBeenCalledWith({
                where: {
                    tenantId: mockTenantId
                }
            });
        });
        it('should return null if subscription not found', async ()=>{
            subscriptionRepository.findOne.mockResolvedValue(null);
            const result = await service.getSubscription(mockTenantId);
            expect(result).toBeNull();
        });
    });
    describe('cancelSubscription', ()=>{
        it('should cancel subscription immediately via Stripe', async ()=>{
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            stripeService.cancelSubscription.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({});
            await service.cancelSubscription(mockTenantId, false);
            expect(stripeService.cancelSubscription).toHaveBeenCalledWith(mockExternalId, false);
            expect(subscriptionRepository.update).toHaveBeenCalledWith({
                id: mockSubscriptionId
            }, {
                status: _subscriptionenum.SubscriptionStatus.CANCELED,
                canceledAt: expect.any(Date)
            });
        });
        it('should cancel subscription at period end via Stripe', async ()=>{
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            stripeService.cancelSubscription.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({});
            await service.cancelSubscription(mockTenantId, true);
            expect(stripeService.cancelSubscription).toHaveBeenCalledWith(mockExternalId, true);
            expect(subscriptionRepository.update).toHaveBeenCalledWith({
                id: mockSubscriptionId
            }, {
                cancelAtPeriodEnd: true
            });
        });
        it('should handle subscription without Stripe external ID', async ()=>{
            const localSubscription = {
                ...mockSubscription,
                provider: _subscriptionenum.SubscriptionProvider.WAYFORPAY,
                subscriptionExternalId: null
            };
            subscriptionRepository.findOne.mockResolvedValue(localSubscription);
            subscriptionRepository.update.mockResolvedValue({});
            await service.cancelSubscription(mockTenantId, false);
            expect(stripeService.cancelSubscription).not.toHaveBeenCalled();
            expect(subscriptionRepository.update).toHaveBeenCalled();
        });
    });
    describe('resumeSubscription', ()=>{
        it('should resume subscription via Stripe', async ()=>{
            const canceledSubscription = {
                ...mockSubscription,
                status: _subscriptionenum.SubscriptionStatus.CANCELED,
                cancelAtPeriodEnd: true
            };
            subscriptionRepository.findOne.mockResolvedValue(canceledSubscription);
            stripeService.resumeSubscription.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({});
            await service.resumeSubscription(mockTenantId);
            expect(stripeService.resumeSubscription).toHaveBeenCalledWith(mockExternalId);
            expect(subscriptionRepository.update).toHaveBeenCalledWith({
                id: mockSubscriptionId
            }, {
                status: _subscriptionenum.SubscriptionStatus.ACTIVE,
                plan: canceledSubscription.plan,
                cancelAtPeriodEnd: false,
                canceledAt: null
            });
        });
        it('should resume and upgrade subscription plan', async ()=>{
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            stripeService.resumeSubscription.mockResolvedValue();
            stripeService.updateSubscriptionPlan.mockResolvedValue();
            subscriptionRepository.update.mockResolvedValue({});
            await service.resumeSubscription(mockTenantId, _subscriptionenum.SubscriptionPlan.ENTERPRISE);
            expect(stripeService.updateSubscriptionPlan).toHaveBeenCalledWith(mockExternalId, _subscriptionenum.SubscriptionPlan.ENTERPRISE);
            expect(subscriptionRepository.update).toHaveBeenCalledWith({
                id: mockSubscriptionId
            }, {
                status: _subscriptionenum.SubscriptionStatus.ACTIVE,
                plan: _subscriptionenum.SubscriptionPlan.ENTERPRISE,
                cancelAtPeriodEnd: false,
                canceledAt: null
            });
        });
    });
    describe('getInvoices', ()=>{
        it('should return empty array for Stripe subscription', async ()=>{
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            const result = await service.getInvoices(mockTenantId);
            expect(result).toEqual([]);
        });
        it('should return empty array for non-Stripe subscription', async ()=>{
            const wayforpaySubscription = {
                ...mockSubscription,
                provider: _subscriptionenum.SubscriptionProvider.WAYFORPAY
            };
            subscriptionRepository.findOne.mockResolvedValue(wayforpaySubscription);
            const result = await service.getInvoices(mockTenantId);
            expect(result).toEqual([]);
        });
    });
    describe('getPaymentMethods', ()=>{
        it('should return empty array for Stripe subscription', async ()=>{
            subscriptionRepository.findOne.mockResolvedValue(mockSubscription);
            const result = await service.getPaymentMethods(mockTenantId);
            expect(result).toEqual([]);
        });
    });
    describe('updateSubscriptionFromWebhook', ()=>{
        it('should update subscription from webhook data', async ()=>{
            subscriptionRepository.update.mockResolvedValue({});
            await service.updateSubscriptionFromWebhook(mockExternalId, _subscriptionenum.SubscriptionProvider.STRIPE, {
                status: _subscriptionenum.SubscriptionStatus.ACTIVE,
                plan: _subscriptionenum.SubscriptionPlan.ENTERPRISE,
                currentPeriodEndAt: new Date('2024-12-31'),
                amountCents: 4999,
                currency: 'USD'
            });
            expect(subscriptionRepository.update).toHaveBeenCalledWith({
                subscriptionExternalId: mockExternalId,
                provider: _subscriptionenum.SubscriptionProvider.STRIPE
            }, {
                status: _subscriptionenum.SubscriptionStatus.ACTIVE,
                plan: _subscriptionenum.SubscriptionPlan.ENTERPRISE,
                currentPeriodEndAt: expect.any(Date),
                amountCents: 4999,
                currency: 'USD',
                lastSyncedAt: expect.any(Date)
            });
        });
        it('should update only provided fields', async ()=>{
            subscriptionRepository.update.mockResolvedValue({});
            await service.updateSubscriptionFromWebhook(mockExternalId, _subscriptionenum.SubscriptionProvider.STRIPE, {
                status: _subscriptionenum.SubscriptionStatus.PAST_DUE
            });
            expect(subscriptionRepository.update).toHaveBeenCalledWith({
                subscriptionExternalId: mockExternalId,
                provider: _subscriptionenum.SubscriptionProvider.STRIPE
            }, {
                status: _subscriptionenum.SubscriptionStatus.PAST_DUE,
                lastSyncedAt: expect.any(Date)
            });
        });
    });
    describe('createSubscriptionFromWebhook', ()=>{
        it('should create subscription from webhook data', async ()=>{
            subscriptionRepository.save.mockResolvedValue({});
            await service.createSubscriptionFromWebhook(mockTenantId, mockExternalId, _subscriptionenum.SubscriptionProvider.STRIPE, {
                plan: _subscriptionenum.SubscriptionPlan.PROFESSIONAL,
                status: _subscriptionenum.SubscriptionStatus.ACTIVE,
                trialStartAt: new Date(),
                trialEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                currentPeriodStartAt: new Date(),
                currentPeriodEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                amountCents: 2999,
                currency: 'USD'
            });
            expect(subscriptionRepository.save).toHaveBeenCalledWith({
                tenantId: mockTenantId,
                provider: _subscriptionenum.SubscriptionProvider.STRIPE,
                externalId: mockExternalId,
                subscriptionExternalId: mockExternalId,
                plan: _subscriptionenum.SubscriptionPlan.PROFESSIONAL,
                status: _subscriptionenum.SubscriptionStatus.ACTIVE,
                trialStartAt: expect.any(Date),
                trialEndAt: expect.any(Date),
                currentPeriodStartAt: expect.any(Date),
                currentPeriodEndAt: expect.any(Date),
                amountCents: 2999,
                currency: 'USD',
                lastSyncedAt: expect.any(Date)
            });
        });
        it('should create subscription with minimal data', async ()=>{
            subscriptionRepository.save.mockResolvedValue({});
            await service.createSubscriptionFromWebhook(mockTenantId, mockExternalId, _subscriptionenum.SubscriptionProvider.WAYFORPAY, {
                plan: _subscriptionenum.SubscriptionPlan.BASIC,
                status: _subscriptionenum.SubscriptionStatus.TRIALING
            });
            expect(subscriptionRepository.save).toHaveBeenCalledWith({
                tenantId: mockTenantId,
                provider: _subscriptionenum.SubscriptionProvider.WAYFORPAY,
                externalId: mockExternalId,
                subscriptionExternalId: mockExternalId,
                plan: _subscriptionenum.SubscriptionPlan.BASIC,
                status: _subscriptionenum.SubscriptionStatus.TRIALING,
                lastSyncedAt: expect.any(Date)
            });
        });
    });
});

//# sourceMappingURL=billing.service.spec.js.map