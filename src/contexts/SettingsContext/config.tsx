export interface IConfig {
  [key: string]: {
    name_system: string;
    socket_url: string;
    base_url: string;
    color_scheme: {
      primary: string;
      secondary: string;
    };
    logo: string;
    logoSidebar: string;
    custom_fields?: {
      [key: string]: {
        type: string;
        label: string;
        default_value: string;
        name: string;
      };
    };
  };
}

export const Config: IConfig = {
  'localhost:4200': {
    name_system: 'New Test',
    // base_url: 'https://growforce.dev.sejanalu.com.br/api/v1/',
    socket_url: 'http://localhost:3334/',
    base_url: 'http://localhost:3334/api/v1/',
    color_scheme: {
      primary: '#F71962',
      secondary: '#fff',
    },
    logo: '/svg/logo-chip2go-branca.svg',
    logoSidebar: '/svg/logo-chip2go-branca.svg',
    custom_fields: {
      activation_date: {
        type: 'date',
        label: 'Data de Ativação',
        default_value: '',
        name: 'activation_date',
      },
    },
  },
  'admin.sejanalu.com.br': {
    name_system: 'Nalu',
    socket_url: 'https://growforce.sejanalu.com.br/',
    base_url: 'https://growforce.sejanalu.com.br/api/v1/',
    color_scheme: {
      primary: '#C83726',
      secondary: '#fff',
    },
    logo: '/svg/logo-nalu.svg',
    logoSidebar: '/svg/logo-nalu.svg',
    custom_fields: {},
  },
  'admin.dev.sejanalu.com.br': {
    name_system: 'Nalu',
    socket_url: 'https://growforce.dev.sejanalu.com.br/api/v1/',
    base_url: 'https://growforce.dev.sejanalu.com.br/api/v1/',
    color_scheme: {
      primary: '#C83726',
      secondary: '#fff',
    },
    logo: '/svg/logo-nalu.svg',
    logoSidebar: '/svg/logo-nalu.svg',
    custom_fields: {},
  },
  'admin.chip2go.com.br': {
    name_system: 'Chip2Go',
    socket_url: 'https://growforce.chip2go.com.br/',
    base_url: 'https://growforce.chip2go.com.br/api/v1/',
    color_scheme: {
      primary: '#F71962',
      secondary: '#000',
    },
    logo: '/svg/logo-chip2go-branca.svg',
    logoSidebar: '/svg/logo-chip2go-branca.svg',
    custom_fields: {
      activation_date: {
        type: 'date',
        label: 'Data de Ativação',
        default_value: '',
        name: 'activation_date',
      },
    },
  },
  'admin.dev.chip2go.com.br': {
    name_system: 'Chip2Go',
    socket_url: 'https://growforce.dev.chip2go.com.br/',
    base_url: 'https://growforce.dev.chip2go.com.br/api/v1/',
    color_scheme: {
      primary: '#F71962',
      secondary: '#000',
    },
    logo: '/svg/logo-chip2go-branca.svg',
    logoSidebar: '/svg/logo-chip2go-branca.svg',
    custom_fields: {
      activation_date: {
        type: 'date',
        label: 'Data de Ativação',
        default_value: '',
        name: 'activation_date',
      },
    },
  },
  'admin.toyu.com.br': {
    name_system: 'Toyu',
    socket_url: 'https://growforce.toyu.com.br/',
    base_url: 'https://growforce.toyu.com.br/api/v1/',
    color_scheme: {
      primary: '#000',
      secondary: '#fff',
    },
    logo: '/svg/logo-nalu.svg',
    logoSidebar: '/svg/logo-nalu.svg',
    custom_fields: {},
  },
  'admin.dev.toyu.com.br': {
    name_system: 'Toyu',
    socket_url: 'https://growforce.dev.toyu.com.br/',
    base_url: 'https://growforce.dev.toyu.com.br/api/v1/',
    color_scheme: {
      primary: '#000',
      secondary: '#fff',
    },
    logo: '/svg/logo-nalu.svg',
    logoSidebar: '/svg/logo-nalu.svg',
    custom_fields: {},
  },
  'admin.seja2share.com.br': {
    name_system: '2Share',
    socket_url: 'https://growforce.seja2share.com.br/',
    base_url: 'https://growforce.seja2share.com.br/api/v1/',
    color_scheme: {
      primary: '#ffa221',
      secondary: '#fff',
    },
    logo: '/svg/logo-nalu.svg',
    logoSidebar: '/svg/logo-nalu.svg',
    custom_fields: {},
  },
  'admin.dev.seja2share.com.br': {
    name_system: '2Share',
    socket_url: 'https://growforce.dev.seja2share.com.br/',
    base_url: 'https://growforce.dev.seja2share.com.br/api/v1/',
    color_scheme: {
      primary: '#ffa221',
      secondary: '#fff',
    },
    logo: '/svg/logo-nalu.svg',
    logoSidebar: '/svg/logo-nalu.svg',
    custom_fields: {},
  },
};
