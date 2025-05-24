export const mockSalesHistoryResponse = {
  items: [
    {
      purchase: {
        transaction: 'HP12345678901234',
        order_date: 1704067200000,
        approved_date: 1704067800000,
        status: 'APPROVED',
        payment: {
          type: 'CREDIT_CARD',
          installments_number: 3,
          method: 'VISA'
        },
        commission: {
          value: 89.91,
          currency_value: 'BRL',
          percentage: 90
        },
        price: {
          value: 99.90,
          currency_value: 'BRL'
        },
        full_price: {
          value: 99.90,
          currency_value: 'BRL'
        },
        warranty_expire_date: 1704499200000,
        tracking: {
          source: 'ORGANIC',
          source_sck: 'src_123'
        },
        purchase_subscription: {
          subscriber_code: 'sub_123',
          status: 'ACTIVE'
        },
        recurrency_number: 1,
        is_subscription: true
      },
      product: {
        id: 1234567,
        name: 'Curso Completo de Marketing Digital',
        ucode: 'prod_mk_digital_2024'
      },
      buyer: {
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        ucode: 'buy_maria_123'
      },
      producer: {
        name: 'João Producer',
        ucode: 'prod_joao_456'
      },
      sales_nature: 'PRODUCER',
      affiliate: null
    },
    {
      purchase: {
        transaction: 'HP98765432109876',
        order_date: 1703980800000,
        approved_date: 1703981400000,
        status: 'APPROVED',
        payment: {
          type: 'BILLET',
          installments_number: 1,
          method: 'BILLET'
        },
        commission: {
          value: 149.85,
          currency_value: 'BRL',
          percentage: 50
        },
        price: {
          value: 299.70,
          currency_value: 'BRL'
        },
        full_price: {
          value: 299.70,
          currency_value: 'BRL'
        },
        warranty_expire_date: null,
        tracking: {
          source: 'AFFILIATE',
          source_sck: 'aff_789'
        },
        purchase_subscription: null,
        recurrency_number: null,
        is_subscription: false
      },
      product: {
        id: 9876543,
        name: 'E-book Estratégias de Vendas',
        ucode: 'prod_ebook_vendas'
      },
      buyer: {
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@example.com',
        ucode: 'buy_carlos_789'
      },
      producer: {
        name: 'Ana Producer',
        ucode: 'prod_ana_321'
      },
      sales_nature: 'AFFILIATE',
      affiliate: {
        name: 'Pedro Afiliado',
        ucode: 'aff_pedro_789'
      }
    }
  ],
  page_info: {
    results_per_page: 50,
    total_results: 2,
    next_page_token: null
  }
};

export const mockSalesHistoryCancelled = {
  items: [
    {
      purchase: {
        transaction: 'HP11111111111111',
        order_date: 1703462400000,
        approved_date: null,
        status: 'CANCELLED',
        payment: {
          type: 'PIX',
          installments_number: 1,
          method: 'PIX'
        },
        commission: {
          value: 0,
          currency_value: 'BRL',
          percentage: 0
        },
        price: {
          value: 197.00,
          currency_value: 'BRL'
        },
        full_price: {
          value: 197.00,
          currency_value: 'BRL'
        },
        warranty_expire_date: null,
        tracking: {
          source: 'DIRECT',
          source_sck: null
        },
        purchase_subscription: null,
        recurrency_number: null,
        is_subscription: false
      },
      product: {
        id: 5555555,
        name: 'Workshop Online de Produtividade',
        ucode: 'prod_workshop_prod'
      },
      buyer: {
        name: 'Fernanda Costa',
        email: 'fernanda.costa@example.com',
        ucode: 'buy_fernanda_555'
      },
      producer: {
        name: 'Roberto Producer',
        ucode: 'prod_roberto_999'
      },
      sales_nature: 'PRODUCER',
      affiliate: null
    }
  ],
  page_info: {
    results_per_page: 50,
    total_results: 1,
    next_page_token: null
  }
};

export const mockSalesHistoryError = {
  error: {
    code: 'UNAUTHORIZED',
    message: 'Invalid authentication credentials'
  }
};