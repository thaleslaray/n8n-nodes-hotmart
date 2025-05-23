export const mockSubscriptionList = {
  items: [
    {
      subscription_id: 'sub_123',
      status: 'ACTIVE',
      subscriber: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      product: {
        id: 'prod_123',
        name: 'Test Product'
      },
      price: {
        value: 99.90,
        currency_code: 'BRL'
      },
      creation_date: 1704067200000,
      last_billing_date: 1704067200000,
      next_billing_date: 1706745600000
    }
  ],
  page_info: {
    total_results: 1,
    next_page_token: null
  }
};

export const mockSubscriptionCancelled = {
  subscription_id: 'sub_123',
  status: 'CANCELLED',
  cancellation_date: 1704153600000
};