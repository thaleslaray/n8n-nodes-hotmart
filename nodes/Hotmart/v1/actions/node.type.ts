export type HotmartResourceType =
	| 'subscription'
	| 'sales'
	| 'coupon'
	| 'product'
	| 'club'
	| 'ticket';

export type SubscriptionOperationType =
	| 'getAll'
	| 'cancel'
	| 'cancelList'
	| 'changeBillingDate'
	| 'getPurchases'
	| 'reactivate'
	| 'getSummary';

export type SalesOperationType =
	| 'getHistory'
	| 'getParticipants'
	| 'getCommissions'
	| 'getPriceDetails'
	| 'getRefunds'
	| 'getSummary';

export type CouponOperationType =
	| 'getAll';

export type ProductOperationType =
	| 'getAll';

export type ClubOperationType =
	| 'getAll';

export type TicketOperationType =
	| 'getAll';

export type HotmartOperationType =
	| SubscriptionOperationType
	| SalesOperationType
	| CouponOperationType
	| ProductOperationType
	| ClubOperationType
	| TicketOperationType;

export type HotmartType = {
	resource: HotmartResourceType;
	operation: HotmartOperationType;
};
