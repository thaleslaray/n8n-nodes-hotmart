export const mockClubListResponse = {
  items: [
    {
      club_cod: 'CLUB_PREMIUM_2024',
      product_id: 7777777,
      product_name: 'Área de Membros Premium',
      club_name: 'Premium Members Club',
      status: 'ACTIVE',
      creation_date: 1700438400000,
      total_students: 3421,
      total_modules: 12,
      total_pages: 48,
      membership_levels: ['BASIC', 'PREMIUM', 'VIP'],
      features: {
        has_forum: true,
        has_certificates: true,
        has_gamification: true,
        has_live_classes: true
      }
    },
    {
      club_cod: 'CLUB_MARKETING_2024',
      product_id: 1234567,
      product_name: 'Curso Completo de Marketing Digital',
      club_name: 'Marketing Masters Club',
      status: 'ACTIVE',
      creation_date: 1704067200000,
      total_students: 1543,
      total_modules: 8,
      total_pages: 32,
      membership_levels: ['STANDARD'],
      features: {
        has_forum: true,
        has_certificates: true,
        has_gamification: false,
        has_live_classes: false
      }
    },
    {
      club_cod: 'CLUB_LEGACY_2023',
      product_id: 3333333,
      product_name: 'Curso Antigo de Vendas',
      club_name: 'Legacy Sales Club',
      status: 'INACTIVE',
      creation_date: 1672531200000,
      total_students: 234,
      total_modules: 5,
      total_pages: 15,
      membership_levels: ['BASIC'],
      features: {
        has_forum: false,
        has_certificates: true,
        has_gamification: false,
        has_live_classes: false
      }
    }
  ],
  page_info: {
    total_results: 3,
    next_page_token: null
  }
};

export const mockClubModulesResponse = {
  club_cod: 'CLUB_PREMIUM_2024',
  modules: [
    {
      module_id: 'mod_intro_001',
      name: 'Introdução ao Curso',
      description: 'Conheça a estrutura do curso e os objetivos de aprendizagem',
      order: 1,
      status: 'PUBLISHED',
      total_pages: 3,
      total_students_completed: 3200,
      completion_percentage: 93.5,
      release_date: 1700438400000,
      is_locked: false
    },
    {
      module_id: 'mod_basics_002',
      name: 'Fundamentos Essenciais',
      description: 'Aprenda os conceitos fundamentais necessários para o curso',
      order: 2,
      status: 'PUBLISHED',
      total_pages: 8,
      total_students_completed: 2890,
      completion_percentage: 84.5,
      release_date: 1701043200000,
      is_locked: false
    },
    {
      module_id: 'mod_advanced_003',
      name: 'Técnicas Avançadas',
      description: 'Domine as técnicas avançadas e estratégias profissionais',
      order: 3,
      status: 'PUBLISHED',
      total_pages: 12,
      total_students_completed: 2102,
      completion_percentage: 61.4,
      release_date: 1702252800000,
      is_locked: false
    },
    {
      module_id: 'mod_bonus_004',
      name: 'Conteúdo Bônus VIP',
      description: 'Material exclusivo para membros VIP',
      order: 4,
      status: 'PUBLISHED',
      total_pages: 5,
      total_students_completed: 456,
      completion_percentage: 13.3,
      release_date: 1703462400000,
      is_locked: true,
      required_membership: 'VIP'
    }
  ]
};

export const mockClubProgressResponse = {
  student: {
    ucode: 'stu_maria_123',
    name: 'Maria Silva',
    email: 'maria.silva@example.com'
  },
  club_cod: 'CLUB_PREMIUM_2024',
  enrollment_date: 1704067200000,
  last_access_date: 1706400000000,
  total_progress_percentage: 75.5,
  modules_progress: [
    {
      module_id: 'mod_intro_001',
      name: 'Introdução ao Curso',
      progress_percentage: 100,
      completed_pages: 3,
      total_pages: 3,
      completion_date: 1704153600000,
      time_spent_minutes: 45
    },
    {
      module_id: 'mod_basics_002',
      name: 'Fundamentos Essenciais',
      progress_percentage: 100,
      completed_pages: 8,
      total_pages: 8,
      completion_date: 1704758400000,
      time_spent_minutes: 240
    },
    {
      module_id: 'mod_advanced_003',
      name: 'Técnicas Avançadas',
      progress_percentage: 50,
      completed_pages: 6,
      total_pages: 12,
      completion_date: null,
      time_spent_minutes: 180
    },
    {
      module_id: 'mod_bonus_004',
      name: 'Conteúdo Bônus VIP',
      progress_percentage: 0,
      completed_pages: 0,
      total_pages: 5,
      completion_date: null,
      time_spent_minutes: 0,
      is_locked: true
    }
  ],
  certificates: [
    {
      certificate_id: 'cert_001',
      module_id: 'mod_intro_001',
      issue_date: 1704153600000,
      certificate_url: 'https://hotmart.com/certificates/cert_001'
    },
    {
      certificate_id: 'cert_002',
      module_id: 'mod_basics_002',
      issue_date: 1704758400000,
      certificate_url: 'https://hotmart.com/certificates/cert_002'
    }
  ],
  achievements: [
    {
      achievement_id: 'ach_first_module',
      name: 'Primeiro Módulo Concluído',
      description: 'Parabéns por completar seu primeiro módulo!',
      earned_date: 1704153600000,
      icon_url: 'https://hotmart.com/achievements/first_module.png'
    }
  ]
};

export const mockClubError = {
  error: {
    code: 'CLUB_NOT_FOUND',
    message: 'Club not found or access denied'
  }
};