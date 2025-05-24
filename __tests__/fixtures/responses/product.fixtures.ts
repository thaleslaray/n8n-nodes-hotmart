export const mockProductListResponse = {
  items: [
    {
      product: {
        id: 1234567,
        name: 'Curso Completo de Marketing Digital',
        ucode: 'prod_mk_digital_2024'
      },
      price: {
        value: 99.90,
        currency_value: 'BRL'
      },
      status: 'ACTIVE',
      creation_date: 1704067200000,
      sales_number: 1543,
      affiliates_number: 87,
      temperature: 'HOT',
      has_co_production: false,
      is_creator_club: false,
      club_cod: null,
      membership_level: null
    },
    {
      product: {
        id: 9876543,
        name: 'E-book Estratégias de Vendas',
        ucode: 'prod_ebook_vendas'
      },
      price: {
        value: 299.70,
        currency_value: 'BRL'
      },
      status: 'ACTIVE',
      creation_date: 1702857600000,
      sales_number: 892,
      affiliates_number: 45,
      temperature: 'WARM',
      has_co_production: true,
      is_creator_club: false,
      club_cod: null,
      membership_level: null
    },
    {
      product: {
        id: 5555555,
        name: 'Workshop Online de Produtividade',
        ucode: 'prod_workshop_prod'
      },
      price: {
        value: 197.00,
        currency_value: 'BRL'
      },
      status: 'INACTIVE',
      creation_date: 1701648000000,
      sales_number: 234,
      affiliates_number: 12,
      temperature: 'COLD',
      has_co_production: false,
      is_creator_club: false,
      club_cod: null,
      membership_level: null
    },
    {
      product: {
        id: 7777777,
        name: 'Área de Membros Premium',
        ucode: 'prod_members_premium'
      },
      price: {
        value: 47.00,
        currency_value: 'BRL'
      },
      status: 'ACTIVE',
      creation_date: 1700438400000,
      sales_number: 3421,
      affiliates_number: 156,
      temperature: 'HOT',
      has_co_production: false,
      is_creator_club: true,
      club_cod: 'CLUB_PREMIUM_2024',
      membership_level: 'PREMIUM'
    }
  ],
  page_info: {
    results_per_page: 50,
    total_results: 4,
    next_page_token: null
  }
};

export const mockProductListEmptyResponse = {
  items: [],
  page_info: {
    results_per_page: 50,
    total_results: 0,
    next_page_token: null
  }
};

export const mockProductListPaginatedResponse = {
  items: [
    {
      product: {
        id: 1111111,
        name: 'Mentoria Individual de Negócios',
        ucode: 'prod_mentoria_neg'
      },
      price: {
        value: 997.00,
        currency_value: 'BRL'
      },
      status: 'ACTIVE',
      creation_date: 1699228800000,
      sales_number: 45,
      affiliates_number: 0,
      temperature: 'COLD',
      has_co_production: false,
      is_creator_club: false,
      club_cod: null,
      membership_level: null
    }
  ],
  page_info: {
    results_per_page: 1,
    total_results: 5,
    next_page_token: 'eyJwYWdlIjoyLCJsaW1pdCI6MX0='
  }
};

export const mockProductListError = {
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.'
  }
};