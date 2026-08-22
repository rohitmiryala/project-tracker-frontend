export const menuItems = [
  {
    'icon': 'layout-dashboard',
    'slug': 'velorak',
    'label': 'Velorak',
    'isTitle': true,
    'children': [
      {
        'url': '/app/dashboard',
        'icon': 'layout-dashboard',
        'slug': 'pages:velorak-dashboard',
        'label': 'Dashboard',
      },
      {
        'url': '/app/clients',
        'icon': 'building-2',
        'slug': 'pages:velorak-clients',
        'label': 'Clients',
      },
      {
        'url': '/app/projects',
        'icon': 'folder-kanban',
        'slug': 'pages:velorak-projects',
        'label': 'Projects',
      },
      {
        'url': '/app/tasks',
        'icon': 'square-kanban',
        'slug': 'pages:velorak-tasks',
        'label': 'Tasks',
      },
      {
        'url': '/app/calendar',
        'icon': 'calendar',
        'slug': 'pages:velorak-calendar',
        'label': 'Calendar',
      },
      {
        'url': '/app/cost-tracking',
        'icon': 'wallet',
        'slug': 'pages:velorak-cost-tracking',
        'label': 'Cost Tracking',
      },
      {
        'url': '/app/reports',
        'icon': 'chart-column',
        'slug': 'pages:velorak-reports',
        'label': 'Reports',
      },
      {
        'url': '/app/profile',
        'icon': 'user-round',
        'slug': 'pages:velorak-profile',
        'label': 'Profile',
      },
      {
        'url': '/app/subscription',
        'icon': 'credit-card',
        'slug': 'pages:velorak-subscription',
        'label': 'Subscription',
      },
      {
        'url': '/app/settings',
        'icon': 'settings',
        'slug': 'pages:velorak-settings',
        'label': 'Settings',
      },
      {
        'url': '/app/chat',
        'icon': 'message-circle',
        'slug': 'pages:velorak-chat',
        'label': 'Chat',
        'badge': {
          'text': 'Soon',
          'className': 'bg-warning text-dark',
        },
      },
      {
        'action': 'logout',
        'icon': 'log-out',
        'slug': 'pages:velorak-logout',
        'label': 'Logout',
        'isSpecial': true,
      },
    ],
  },
  {
    'icon': 'layout-dashboard',
    'slug': 'main',
    'label': 'Main',
    'isTitle': true,
    'children': [
      {
        'icon': 'layout-dashboard',
        'slug': 'dashboards',
        'label': 'Dashboards',
        'children': [
          {
            'url': '/dashboard/ecommerce',
            'slug': 'pages:dashboard-ecommerce',
            'label': 'Ecommerce',
          },
          {
            'url': '/dashboard/projects',
            'slug': 'pages:dashboard-projects',
            'label': 'Projects',
          },
        ],
      },
      {
        'url': '/landing',
        'icon': 'rocket',
        'slug': 'pages:landing',
        'label': 'Landing',
      },
    ],
  },
  {
    'icon': 'layout-grid',
    'slug': 'apps',
    'label': 'Apps',
    'isTitle': true,
    'children': [
      {
        'icon': 'shopping-basket',
        'slug': 'ecommerce',
        'label': 'Ecommerce',
        'children': [
          {
            'icon': 'shirt',
            'slug': 'products',
            'label': 'Products',
            'children': [
              {
                'url': '/apps/ecommerce/products',
                'slug': 'pages:apps-ecommerce-products',
                'label': 'Products',
              },
              {
                'url': '/apps/ecommerce/products-grid',
                'slug': 'pages:apps-ecommerce-products-grid',
                'label': 'Products Grid',
              },
              {
                'url': '/apps/ecommerce/product-details',
                'slug': 'pages:apps-ecommerce-product-details',
                'label': 'Product Details',
              },
              {
                'url': '/apps/ecommerce/product-add',
                'slug': 'pages:apps-ecommerce-product-add',
                'label': 'Add Product',
              },
            ],
          },
          {
            'url': '/apps/ecommerce/categories',
            'icon': 'layout-grid',
            'slug': 'pages:apps-ecommerce-categories',
            'label': 'Categories',
          },
          {
            'icon': 'shopping-bag',
            'slug': 'orders',
            'label': 'Orders',
            'children': [
              {
                'url': '/apps/ecommerce/orders',
                'slug': 'pages:apps-ecommerce-orders',
                'label': 'Orders',
              },
              {
                'url': '/apps/ecommerce/order-details',
                'slug': 'pages:apps-ecommerce-order-details',
                'label': 'Order Details',
              },
              {
                'url': '/apps/ecommerce/order-add',
                'slug': 'pages:apps-ecommerce-order-add',
                'label': 'Add/Edit Order',
              },
            ],
          },
          {
            'url': '/apps/ecommerce/customers',
            'icon': 'users',
            'slug': 'pages:apps-ecommerce-customers',
            'label': 'Customers',
          },
          {
            'url': '/apps/ecommerce/cart',
            'icon': 'shopping-cart',
            'slug': 'pages:apps-ecommerce-cart',
            'label': 'Cart',
          },
          {
            'icon': 'user-star',
            'slug': 'sellers',
            'label': 'Sellers',
            'children': [
              {
                'url': '/apps/ecommerce/sellers',
                'slug': 'pages:apps-ecommerce-sellers',
                'label': 'Sellers',
              },
              {
                'url': '/apps/ecommerce/seller-details',
                'slug': 'pages:apps-ecommerce-seller-details',
                'label': 'Sellers Details',
              },
            ],
          },
          {
            'url': '/apps/ecommerce/refunds',
            'icon': 'banknote-arrow-down',
            'slug': 'pages:apps-ecommerce-refunds',
            'label': 'Refunds',
          },
          {
            'url': '/apps/ecommerce/reviews',
            'icon': 'message-square-quote',
            'slug': 'pages:apps-ecommerce-reviews',
            'label': 'Reviews',
          },
          {
            'url': '/apps/ecommerce/attributes',
            'icon': 'wand-sparkles',
            'slug': 'pages:apps-ecommerce-attributes',
            'label': 'Attributes',
          },
        ],
      },
      {
        'icon': 'handshake',
        'slug': 'crm',
        'label': 'CRM',
        'children': [
          {
            'url': '/apps/crm/contacts',
            'icon': 'users',
            'slug': 'pages:apps-crm-contacts',
            'label': 'Contacts',
          },
          {
            'url': '/apps/crm/opportunities',
            'icon': 'lightbulb',
            'slug': 'pages:apps-crm-opportunities',
            'label': 'Opportunities',
          },
          {
            'url': '/apps/crm/deals',
            'icon': 'signature',
            'slug': 'pages:apps-crm-deals',
            'label': 'Deals',
          },
          {
            'url': '/apps/crm/leads',
            'icon': 'medal',
            'slug': 'pages:apps-crm-leads',
            'label': 'Leads',
          },
          {
            'url': '/apps/crm/pipeline',
            'icon': 'kanban',
            'slug': 'pages:apps-crm-pipeline',
            'label': 'Pipeline',
          },
          {
            'url': '/apps/crm/campaign',
            'icon': 'megaphone',
            'slug': 'pages:apps-crm-campaign',
            'label': 'Campaign',
          },
          {
            'url': '/apps/crm/proposals',
            'icon': 'notebook-pen',
            'slug': 'pages:apps-crm-proposals',
            'label': 'Proposals',
          },
          {
            'url': '/apps/crm/estimations',
            'icon': 'receipt-text',
            'slug': 'pages:apps-crm-estimations',
            'label': 'Estimations',
          },
          {
            'url': '/apps/crm/customers',
            'icon': 'users-round',
            'slug': 'pages:apps-crm-customers',
            'label': 'Customers',
          },
          {
            'url': '/apps/crm/activities',
            'icon': 'activity',
            'slug': 'pages:apps-crm-activities',
            'label': 'Activities',
          },
        ],
      },
      {
        'icon': 'mail',
        'slug': 'email',
        'badge': {
          'text': 'New',
          'className': 'bg-danger text-white',
        },
        'label': 'Email',
        'children': [
          {
            'url': '/apps/email/inbox',
            'slug': 'pages:apps-email-inbox',
            'label': 'Inbox',
          },
          {
            'url': '/apps/email/details',
            'slug': 'pages:apps-email-details',
            'label': 'Details',
          },
          {
            'url': '/apps/email/compose',
            'slug': 'pages:apps-email-compose',
            'label': 'Compose',
          },
        ],
      },
      {
        'icon': 'users',
        'slug': 'users',
        'label': 'Users',
        'children': [
          {
            'url': '/apps/users/contacts',
            'slug': 'pages:apps-users-contacts',
            'label': 'Contacts',
          },
          {
            'url': '/apps/users/profile',
            'slug': 'pages:apps-users-profile',
            'label': 'Profile',
          },
          {
            'url': '/apps/users/account-settings',
            'slug': 'pages:apps-users-account-settings',
            'label': 'Account Settings',
          },
          {
            'url': '/apps/users/roles',
            'slug': 'pages:apps-users-roles',
            'label': 'Roles',
          },
          {
            'url': '/apps/users/role-details',
            'slug': 'pages:apps-users-role-details',
            'label': 'Role Details',
          },
          {
            'url': '/apps/users/permissions',
            'slug': 'pages:apps-users-permissions',
            'label': 'Permissions',
          },
        ],
      },
      {
        'url': '/apps/file-manager',
        'icon': 'folder-open-dot',
        'slug': 'pages:apps-file-manager',
        'label': 'File Manager',
      },
      {
        'url': '/apps/chat',
        'icon': 'message-square-text',
        'slug': 'pages:apps-chat',
        'label': 'Chat',
      },
      {
        'url': '/apps/calendar',
        'icon': 'calendar',
        'slug': 'pages:apps-calendar',
        'label': 'Calendar',
      },
      {
        'url': '/apps/social-feed',
        'icon': 'rss',
        'slug': 'pages:apps-social-feed',
        'label': 'Social Feed',
      },
      {
        'icon': 'receipt-text',
        'slug': 'invoice',
        'label': 'Invoice',
        'children': [
          {
            'url': '/apps/invoice/list',
            'slug': 'pages:apps-invoice-list',
            'label': 'Invoices',
          },
          {
            'url': '/apps/invoice/details',
            'slug': 'pages:apps-invoice-details',
            'label': 'Single Invoice',
          },
          {
            'url': '/apps/invoice/create',
            'slug': 'pages:apps-invoice-create',
            'label': 'New Invoice',
          },
        ],
      },
      {
        'url': '/apps/outlook',
        'icon': 'layout-panel-left',
        'slug': 'pages:apps-outlook',
        'label': 'Outlook View',
      },
      {
        'icon': 'headset',
        'slug': 'support-center',
        'label': 'Support Center',
        'children': [
          {
            'url': '/apps/ticket/list',
            'slug': 'pages:apps-ticket-list',
            'label': 'Tickets List',
          },
          {
            'url': '/apps/ticket/details',
            'slug': 'pages:apps-ticket-details',
            'label': 'Ticket Details',
          },
          {
            'url': '/apps/ticket/create',
            'slug': 'pages:apps-ticket-create',
            'label': 'New Ticket',
          },
        ],
      },
      {
        'url': '/apps/api-keys',
        'icon': 'key',
        'slug': 'pages:apps-api-keys',
        'label': 'API Keys',
      },
    ],
  },
  {
    'icon': 'book-open-text',
    'slug': 'custom-pages',
    'label': 'Custom Pages',
    'isTitle': true,
    'children': [
      {
        'icon': 'book-open-text',
        'slug': 'pages',
        'label': 'Pages',
        'children': [
          {
            'url': '/pages/faq',
            'slug': 'pages:pages-faq',
            'label': 'FAQ',
          },
          {
            'url': '/pages/pricing',
            'slug': 'pages:pages-pricing',
            'label': 'Pricing',
          },
          {
            'url': '/pages/empty',
            'slug': 'pages:pages-empty',
            'label': 'Empty Page',
          },
          {
            'url': '/pages/timeline',
            'slug': 'pages:pages-timeline',
            'label': 'Timeline',
          },
          {
            'url': '/pages/search-results',
            'slug': 'pages:pages-search-results',
            'label': 'Search Results',
          },
          {
            'url': '/pages/coming-soon',
            'slug': 'pages:pages-coming-soon',
            'label': 'Coming Soon',
          },
          {
            'url': '/pages/privacy-policy',
            'slug': 'pages:pages-privacy-policy',
            'label': 'Privacy Policy',
          },
          {
            'url': '/pages/terms-conditions',
            'slug': 'pages:pages-terms-conditions',
            'label': 'Terms & Conditions',
          },
        ],
      },
      {
        'icon': 'cpu',
        'slug': 'plugins',
        'label': 'Plugins',
        'children': [
          {
            'url': '/plugins/sortable',
            'slug': 'pages:plugins-sortable',
            'label': 'Sortable List',
          },
          {
            'url': '/plugins/pdf-viewer',
            'slug': 'pages:plugins-pdf-viewer',
            'label': 'PDF Viewer',
          },
          {
            'url': '/plugins/sweet-alerts',
            'slug': 'pages:plugins-sweet-alerts',
            'label': 'Sweet Alerts',
          },
          {
            'url': '/plugins/pass-meter',
            'slug': 'pages:plugins-pass-meter',
            'label': 'Password Meter',
          },
          {
            'url': '/plugins/clipboard',
            'slug': 'pages:plugins-clipboard',
            'label': 'Clipboard',
          },
          {
            'url': '/plugins/tree-view',
            'slug': 'pages:plugins-tree-view',
            'label': 'Tree View',
          },
          {
            'url': '/plugins/tour',
            'slug': 'pages:plugins-tour',
            'label': 'Tour',
          },
          {
            'url': '/plugins/animation',
            'slug': 'pages:plugins-animation',
            'label': 'Animation',
          },
          {
            'url': '/plugins/video-player',
            'slug': 'pages:plugins-video-player',
            'label': 'Video Player',
          },
        ],
      },
      {
        'icon': 'user-lock',
        'slug': 'authentication',
        'label': 'Authentication',
        'children': [
          {
            'slug': 'auth-basic',
            'label': 'Basic',
            'children': [
              {
                'url': '/auth/sign-in',
                'slug': 'pages:auth-sign-in',
                'label': 'Sign In',
              },
              {
                'url': '/auth/sign-up',
                'slug': 'pages:auth-sign-up',
                'label': 'Sign Up',
              },
              {
                'url': '/auth/reset-pass',
                'slug': 'pages:auth-reset-pass',
                'label': 'Reset Password',
              },
              {
                'url': '/auth/new-pass',
                'slug': 'pages:auth-new-pass',
                'label': 'New Password',
              },
              {
                'url': '/auth/two-factor',
                'slug': 'pages:auth-two-factor',
                'label': 'Two Factor',
              },
              {
                'url': '/auth/lock-screen',
                'slug': 'pages:auth-lock-screen',
                'label': 'Lock Screen',
              },
              {
                'url': '/auth/success-mail',
                'slug': 'pages:auth-success-mail',
                'label': 'Success Mail',
              },
              {
                'url': '/auth/login-pin',
                'slug': 'pages:auth-login-pin',
                'label': 'Login with PIN',
              },
              {
                'url': '/auth/delete-account',
                'slug': 'pages:auth-delete-account',
                'label': 'Delete Account',
              },
            ],
          },
          {
            'slug': 'auth-split',
            'label': 'Split',
            'children': [
              {
                'url': '/auth/split/sign-in',
                'slug': 'pages:auth-split-sign-in',
                'label': 'Sign In',
              },
              {
                'url': '/auth/split/sign-up',
                'slug': 'pages:auth-split-sign-up',
                'label': 'Sign Up',
              },
              {
                'url': '/auth/split/reset-pass',
                'slug': 'pages:auth-split-reset-pass',
                'label': 'Reset Password',
              },
              {
                'url': '/auth/split/new-pass',
                'slug': 'pages:auth-split-new-pass',
                'label': 'New Password',
              },
              {
                'url': '/auth/split/two-factor',
                'slug': 'pages:auth-split-two-factor',
                'label': 'Two Factor',
              },
              {
                'url': '/auth/split/lock-screen',
                'slug': 'pages:auth-split-lock-screen',
                'label': 'Lock Screen',
              },
              {
                'url': '/auth/split/success-mail',
                'slug': 'pages:auth-split-success-mail',
                'label': 'Success Mail',
              },
              {
                'url': '/auth/split/login-pin',
                'slug': 'pages:auth-split-login-pin',
                'label': 'Login with PIN',
              },
              {
                'url': '/auth/split/delete-account',
                'slug': 'pages:auth-split-delete-account',
                'label': 'Delete Account',
              },
            ],
          },
        ],
      },
      {
        'icon': 'alert-triangle',
        'slug': 'error-pages',
        'label': 'Error Pages',
        'children': [
          {
            'url': '/error/400',
            'slug': 'pages:error-400',
            'label': '400 Bad Request',
          },
          {
            'url': '/error/401',
            'slug': 'pages:error-401',
            'label': '401 Unauthorized',
          },
          {
            'url': '/error/403',
            'slug': 'pages:error-403',
            'label': '403 Forbidden',
          },
          {
            'url': '/error/404',
            'slug': 'pages:error-404',
            'label': '404 Not Found',
          },
          {
            'url': '/error/408',
            'slug': 'pages:error-408',
            'label': '408 Request Timeout',
          },
          {
            'url': '/error/500',
            'slug': 'pages:error-500',
            'label': '500 Internal Server',
          },
          {
            'url': '/error/maintenance',
            'slug': 'pages:error-maintenance',
            'label': 'Maintenance',
          },
        ],
      },
    ],
  },
  {
    'icon': 'component',
    'slug': 'components',
    'label': 'Components',
    'isTitle': true,
    'children': [
      {
        'icon': 'component',
        'slug': 'base-ui',
        'label': 'Base UI',
        'children': [
          {
            'url': '/ui/accordions',
            'slug': 'pages:ui-accordions',
            'label': 'Accordions',
          },
          {
            'url': '/ui/alerts',
            'slug': 'pages:ui-alerts',
            'label': 'Alerts',
          },
          {
            'url': '/ui/images',
            'slug': 'pages:ui-images',
            'label': 'Images',
          },
          {
            'url': '/ui/badges',
            'slug': 'pages:ui-badges',
            'label': 'Badges',
          },
          {
            'url': '/ui/breadcrumb',
            'slug': 'pages:ui-breadcrumb',
            'label': 'Breadcrumb',
          },
          {
            'url': '/ui/buttons',
            'slug': 'pages:ui-buttons',
            'label': 'Buttons',
          },
          {
            'url': '/ui/cards',
            'slug': 'pages:ui-cards',
            'label': 'Cards',
          },
          {
            'url': '/ui/carousel',
            'slug': 'pages:ui-carousel',
            'label': 'Carousel',
          },
          {
            'url': '/ui/collapse',
            'slug': 'pages:ui-collapse',
            'label': 'Collapse',
          },
          {
            'url': '/ui/colors',
            'slug': 'pages:ui-colors',
            'label': 'Colors',
          },
          {
            'url': '/ui/dropdowns',
            'slug': 'pages:ui-dropdowns',
            'label': 'Dropdowns',
          },
          {
            'url': '/ui/videos',
            'slug': 'pages:ui-videos',
            'label': 'Videos',
          },
          {
            'url': '/ui/grid',
            'slug': 'pages:ui-grid',
            'label': 'Grid Options',
          },
          {
            'url': '/ui/links',
            'slug': 'pages:ui-links',
            'label': 'Links',
          },
          {
            'url': '/ui/list-group',
            'slug': 'pages:ui-list-group',
            'label': 'List Group',
          },
          {
            'url': '/ui/modals',
            'slug': 'pages:ui-modals',
            'label': 'Modals',
          },
          {
            'url': '/ui/notifications',
            'slug': 'pages:ui-notifications',
            'label': 'Notifications',
          },
          {
            'url': '/ui/offcanvas',
            'slug': 'pages:ui-offcanvas',
            'label': 'Offcanvas',
          },
          {
            'url': '/ui/placeholders',
            'slug': 'pages:ui-placeholders',
            'label': 'Placeholders',
          },
          {
            'url': '/ui/pagination',
            'slug': 'pages:ui-pagination',
            'label': 'Pagination',
          },
          {
            'url': '/ui/popovers',
            'slug': 'pages:ui-popovers',
            'label': 'Popovers',
          },
          {
            'url': '/ui/progress',
            'slug': 'pages:ui-progress',
            'label': 'Progress',
          },
          {
            'url': '/ui/spinners',
            'slug': 'pages:ui-spinners',
            'label': 'Spinners',
          },
          {
            'url': '/ui/tabs',
            'slug': 'pages:ui-tabs',
            'label': 'Tabs',
          },
          {
            'url': '/ui/tooltips',
            'slug': 'pages:ui-tooltips',
            'label': 'Tooltips',
          },
          {
            'url': '/ui/typography',
            'slug': 'pages:ui-typography',
            'label': 'Typography',
          },
          {
            'url': '/ui/utilities',
            'slug': 'pages:ui-utilities',
            'label': 'Utilities',
          },
        ],
      },
      {
        'url': '/widgets',
        'icon': 'layers',
        'slug': 'pages:widgets',
        'label': 'Widgets',
      },
      {
        'icon': 'chart-pie',
        'slug': 'charts',
        'label': 'Charts',
        'children': [
          {
            'slug': 'apex-charts',
            'label': 'Apex Charts',
            'children': [
              {
                'url': '/charts/apex/area',
                'slug': 'pages:charts-apex-area',
                'label': 'Area',
              },
              {
                'url': '/charts/apex/bar',
                'slug': 'pages:charts-apex-bar',
                'label': 'Bar',
              },
              {
                'url': '/charts/apex/bubble',
                'slug': 'pages:charts-apex-bubble',
                'label': 'Bubble',
              },
              {
                'url': '/charts/apex/candlestick',
                'slug': 'pages:charts-apex-candlestick',
                'label': 'Candlestick',
              },
              {
                'url': '/charts/apex/column',
                'slug': 'pages:charts-apex-column',
                'label': 'Column',
              },
              {
                'url': '/charts/apex/heatmap',
                'slug': 'pages:charts-apex-heatmap',
                'label': 'Heatmap',
              },
              {
                'url': '/charts/apex/line',
                'slug': 'pages:charts-apex-line',
                'label': 'Line',
              },
              {
                'url': '/charts/apex/mixed',
                'slug': 'pages:charts-apex-mixed',
                'label': 'Mixed',
              },
              {
                'url': '/charts/apex/timeline',
                'slug': 'pages:charts-apex-timeline',
                'label': 'Timeline',
              },
              {
                'url': '/charts/apex/boxplot',
                'slug': 'pages:charts-apex-boxplot',
                'label': 'Boxplot',
              },
              {
                'url': '/charts/apex/treemap',
                'slug': 'pages:charts-apex-treemap',
                'label': 'Treemap',
              },
              {
                'url': '/charts/apex/pie',
                'slug': 'pages:charts-apex-pie',
                'label': 'Pie',
              },
              {
                'url': '/charts/apex/radar',
                'slug': 'pages:charts-apex-radar',
                'label': 'Radar',
              },
              {
                'url': '/charts/apex/radialbar',
                'slug': 'pages:charts-apex-radialbar',
                'label': 'RadialBar',
              },
              {
                'url': '/charts/apex/scatter',
                'slug': 'pages:charts-apex-scatter',
                'label': 'Scatter',
              },
              {
                'url': '/charts/apex/polar-area',
                'slug': 'pages:charts-apex-polar-area',
                'label': 'Polar Area',
              },
              {
                'url': '/charts/apex/sparklines',
                'slug': 'pages:charts-apex-sparklines',
                'label': 'Sparklines',
              },
              {
                'url': '/charts/apex/range',
                'slug': 'pages:charts-apex-range',
                'label': 'Range',
              },
              {
                'url': '/charts/apex/funnel',
                'slug': 'pages:charts-apex-funnel',
                'label': 'Funnel',
              },
              {
                'url': '/charts/apex/slope',
                'slug': 'pages:charts-apex-slope',
                'label': 'Slope',
              },
            ],
          },
          {
            'slug': 'chartjs',
            'label': 'Chart Js',
            'children': [
              {
                'url': '/charts/chartjs/area',
                'slug': 'pages:charts-chartjs-area',
                'label': 'Area',
              },
              {
                'url': '/charts/chartjs/bar',
                'slug': 'pages:charts-chartjs-bar',
                'label': 'Bar',
              },
              {
                'url': '/charts/chartjs/line',
                'slug': 'pages:charts-chartjs-line',
                'label': 'Line',
              },
              {
                'url': '/charts/chartjs/other',
                'slug': 'pages:charts-chartjs-other',
                'label': 'Other',
              },
            ],
          },
        ],
      },
      {
        'icon': 'clipboard-type',
        'slug': 'forms',
        'label': 'Forms',
        'children': [
          {
            'url': '/form/elements',
            'slug': 'pages:form-elements',
            'label': 'Basic Elements',
          },
          {
            'url': '/form/pickers',
            'slug': 'pages:form-pickers',
            'label': 'Pickers',
          },
          {
            'url': '/form/select',
            'slug': 'pages:form-select',
            'label': 'Select',
          },
          {
            'url': '/form/validation',
            'slug': 'pages:form-validation',
            'label': 'Validation',
          },
          {
            'url': '/form/wizard',
            'slug': 'pages:form-wizard',
            'label': 'Wizard',
          },
          {
            'url': '/form/fileuploads',
            'slug': 'pages:form-fileuploads',
            'label': 'File Uploads',
          },
          {
            'url': '/form/text-editors',
            'slug': 'pages:form-text-editors',
            'label': 'Text Editors',
          },
          {
            'url': '/form/range-slider',
            'slug': 'pages:form-range-slider',
            'label': 'Range Slider',
          },
          {
            'url': '/form/layout',
            'slug': 'pages:form-layout',
            'label': 'Layouts',
          },
          {
            'url': '/form/other-plugin',
            'slug': 'pages:form-other-plugin',
            'label': 'Other Plugins',
          },
        ],
      },
      {
        'icon': 'table-2',
        'slug': 'tables',
        'label': 'Tables',
        'children': [
          {
            'url': '/tables/static',
            'slug': 'pages:tables-static',
            'label': 'Static Tables',
          },
          {
            'url': '/tables/custom',
            'slug': 'pages:tables-custom',
            'label': 'Custom Tables',
          },
          {
            'slug': 'datatables',
            'badge': {
              'text': '15',
              'className': 'bg-success text-white',
            },
            'label': 'DataTables',
            'children': [
              {
                'url': '/tables/datatables/basic',
                'slug': 'pages:tables-datatables-basic',
                'label': 'Basic',
              },
              {
                'url': '/tables/datatables/export-data',
                'slug': 'pages:tables-datatables-export-data',
                'label': 'Export Data',
              },
              {
                'url': '/tables/datatables/select',
                'slug': 'pages:tables-datatables-select',
                'label': 'Select',
              },
              {
                'url': '/tables/datatables/ajax',
                'slug': 'pages:tables-datatables-ajax',
                'label': 'Ajax',
              },
              {
                'url': '/tables/datatables/javascript',
                'slug': 'pages:tables-datatables-javascript',
                'label': 'Javascript Source',
              },
              {
                'url': '/tables/datatables/rendering',
                'slug': 'pages:tables-datatables-rendering',
                'label': 'Data Rendering',
              },
              {
                'url': '/tables/datatables/scroll',
                'slug': 'pages:tables-datatables-scroll',
                'label': 'Scroll',
              },
              {
                'url': '/tables/datatables/fixed-columns',
                'slug': 'pages:tables-datatables-fixed-columns',
                'label': 'Fixed Columns',
              },
              {
                'url': '/tables/datatables/fixed-header',
                'slug': 'pages:tables-datatables-fixed-header',
                'label': 'Fixed Header',
              },
              {
                'url': '/tables/datatables/columns',
                'slug': 'pages:tables-datatables-columns',
                'label': 'Show & Hide Column',
              },
              {
                'url': '/tables/datatables/child-rows',
                'slug': 'pages:tables-datatables-child-rows',
                'label': 'Child Rows',
              },
              {
                'url': '/tables/datatables/column-searching',
                'slug': 'pages:tables-datatables-column-searching',
                'label': 'Column Searching',
              },
              {
                'url': '/tables/datatables/rows-add',
                'slug': 'pages:tables-datatables-rows-add',
                'label': 'Add Rows',
              },
              {
                'url': '/tables/datatables/checkbox-select',
                'slug': 'pages:tables-datatables-checkbox-select',
                'label': 'Checkbox Select',
              },
            ],
          },
        ],
      },
      {
        'icon': 'cannabis',
        'slug': 'icons',
        'label': 'Icons',
        'children': [
          {
            'url': '/icons/tabler',
            'slug': 'pages:icons-tabler',
            'label': 'Tabler',
          },
          {
            'url': '/icons/lucide',
            'slug': 'pages:icons-lucide',
            'label': 'Lucide',
          },
          {
            'url': '/icons/flags',
            'slug': 'pages:icons-flags',
            'label': 'Flags',
          },
        ],
      },
      {
        'icon': 'map',
        'slug': 'maps',
        'label': 'Maps',
        'children': [
          {
            'url': '/maps/vector',
            'slug': 'pages:maps-vector',
            'label': 'Vector Maps',
          },
          {
            'url': '/maps/leaflet',
            'slug': 'pages:maps-leaflet',
            'label': 'Leaflet Maps',
          },
        ],
      },
    ],
  },
  {
    'icon': 'list-tree',
    'slug': 'menu-items',
    'label': 'Menu Items',
    'isTitle': true,
    'children': [
      {
        'icon': 'list-tree',
        'slug': 'menu-levels',
        'label': 'Menu Levels',
        'children': [
          {
            'slug': 'second-level',
            'label': 'Second Level',
            'children': [
              {
                'slug': 'menu-item-1',
                'label': 'Item 2.1',
              },
              {
                'slug': 'menu-item-2',
                'label': 'Item 2.2',
              },
            ],
          },
          {
            'slug': 'second-level-2',
            'label': 'Second Level',
            'children': [
              {
                'slug': 'menu-item-3',
                'label': 'Item 2.1',
              },
              {
                'slug': 'menu-item-4',
                'label': 'Item 2.2',
                'children': [
                  {
                    'slug': 'menu-item-5',
                    'label': 'Item 3.1',
                  },
                  {
                    'slug': 'menu-item-6',
                    'label': 'Item 3.2',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        'icon': 'ban',
        'slug': 'disabled-menu',
        'label': 'Disabled Menu',
        'isDisabled': true,
      },
    ],
  },
]
