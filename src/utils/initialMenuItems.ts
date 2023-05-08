import { MenuItem } from "@growth/growforce-admin-ui/contexts/LayoutDisclosure";

export const initialMenuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        link: '/',
        icon: 'bx bxs-layout',
    },
    {
        id: 'products',
        label: 'Produtos',
        icon: 'bx bx-cube',
        subItems: [
            {
                id: 'read-products',
                label: 'Lista',
                link: '/products',
                parentId: 'products',
            },
            {
                id: 'create-products',
                label: 'Criar',
                link: '/products/create',
                parentId: 'products',
            },
        ],
    },
    {
        id: 'orders',
        label: 'Pedidos',
        icon: 'bx bx-list-ul',
        subItems: [
            {
                id: 'read-orders',
                label: 'Lista',
                link: '/orders',
                parentId: 'orders',
            },
            {
                id: 'create-orders',
                label: 'Criar',
                link: '/orders/create',
                parentId: 'orders',
            },
        ],
    },
    {
        id: 'coupons',
        label: 'Cupons',
        icon: 'bx bxs-discount',
        subItems: [
            {
                id: 'read-coupons',
                label: 'Lista',
                link: '/coupons',
                parentId: 'coupons',
            },
        ],

    },
    {
        id: 'tags',
        label: 'Tags',
        icon: 'bx bx-purchase-tag-alt',
        subItems: [
            {
                id: 'read-tags',
                label: 'Lista',
                link: '/tags',
                parentId: 'tags',
            },
            {
                id: 'create-tags',
                label: 'Criar',
                link: '/tags/create',
                parentId: 'tags',
            },
        ],

    },
    {
        id: 'categories',
        label: 'Categorias',
        icon: 'bx bxs-category',
        subItems: [
            {
                id: 'read-categories',
                label: 'Lista',
                link: '/categories',
                parentId: 'categories',
            },
            {
                id: 'create-categories',
                label: 'Criar',
                link: '/categories/create',
                parentId: 'categories',
            },
        ],

    },
    {
        id: 'customers',
        label: 'Clientes',
        icon: 'bx bxs-user',
        subItems: [
            {
                id: 'read-customers',
                label: 'Lista',
                link: '/customers',
                parentId: 'customers',
            },
            {
                id: 'create-customers',
                label: 'Criar',
                link: '/customers/create',
                parentId: 'customers',
            },
        ],

    },
    {
        id: 'reports',
        label: 'Relatórios',
        icon: 'bx bx-file',
        subItems: [
            {
                id: 'read-reports',
                label: 'Baixar',
                link: '/reports',
                parentId: 'reports',
            },
        ],

    },
    {
        id: 'banners',
        label: 'Banners',
        icon: 'bx bxs-dock-top',
        subItems: [
            {
                id: 'read-banners',
                label: 'Lista',
                link: '/banners',
                parentId: 'banners',
            },
            {
                id: 'create-banners',
                label: 'Criar',
                link: '/banners/create',
                parentId: 'banenrs',
            },
        ],

    },
    {
        id: 'banner-collection',
        label: 'Coleção de banners',
        icon: 'bx bxs-collection',
        subItems: [
            {
                id: 'read-banners',
                label: 'Lista',
                link: '/colecao-banners',
                parentId: 'banners',
            },
            {
                id: 'create-banners',
                label: 'Criar',
                link: '/colecao-banners/create',
                parentId: 'banenrs',
            },
        ],

    },
    {
        id: 'companies',
        label: 'Empresas',
        icon: 'bx bx-buildings',
        subItems: [
            {
                id: 'read-companies',
                label: 'Lista',
                link: '/companies',
                parentId: 'companies',
            },
            {
                id: 'create-companies',
                label: 'Criar',
                link: '/companies/create',
                parentId: 'companies',
            },
        ],

    },
    {
        id: 'price-list',
        label: 'Lista de Preços',
        icon: 'bx bx-coin-stack',
        subItems: [
            {
                id: 'read-price-list',
                label: 'Lista',
                link: '/price-lists',
                parentId: 'price-list',
            },
            {
                id: 'create-price-list',
                label: 'Criar',
                link: '/price-lists/create',
                parentId: 'price-list',
            },
        ],

    },
    {
        id: 'live-stream',
        label: 'Live Shopping',
        icon: 'bx bx-tv',
        subItems: [
            {
                id: 'read-live-stream',
                label: 'Ver live',
                link: '/live-stream',
                parentId: 'live-stream',
            },
            // {
            //     id: 'create-live-stream',
            //     label: 'Criar',
            //     link: '/price-lists/create',
            //     parentId: 'price-list',
            // },
        ],

    },
];