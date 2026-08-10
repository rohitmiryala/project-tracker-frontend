export const navItems = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'Why Velorak', href: '#why' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#plans' },
  { label: 'FAQ', href: '#faq' },
]

/** Why choose Velorak — tabbed explanations + horizontal screenshot rails */
export const whyChooseData = [
  {
    id: 'unified',
    tab: 'One workspace',
    icon: 'layers',
    title: 'Delivery and cost live in one workspace',
    description:
      'Stop jumping between a task tool and a spreadsheet. Velorak keeps projects, features, tasks, time, and budgets in the same company subscription so leaders see work and spend together.',
    points: [
      'Projects through cost in one product',
      'No export gymnastics for monthly reviews',
      'Clear seat roles for admin, leaders, and members',
    ],
    screens: [
      {
        title: 'Company dashboard',
        hint: 'Drop dashboard screenshot',
        pathHint: 'landing/why-dashboard.png',
      },
      {
        title: 'Project overview',
        hint: 'Drop project screenshot',
        pathHint: 'landing/why-project.png',
      },
      {
        title: 'Cost rollup',
        hint: 'Drop cost screenshot',
        pathHint: 'landing/why-cost.png',
      },
    ],
  },
  {
    id: 'visibility',
    tab: 'Live visibility',
    icon: 'eye',
    title: 'See risk before a project slips',
    description:
      'Time logs feed budgets and thresholds in real time. Admins and leaders catch overspend and overdue work early — while the team still ships on the board.',
    points: [
      'Budget vs spend without waiting for finance close',
      'Threshold warnings on projects that need attention',
      'Overdue tasks next to cost, not buried in another app',
    ],
    screens: [
      {
        title: 'Budget thresholds',
        hint: 'Drop budget screenshot',
        pathHint: 'landing/why-budget.png',
      },
      {
        title: 'Tasks board',
        hint: 'Drop tasks screenshot',
        pathHint: 'landing/why-tasks.png',
      },
      {
        title: 'Alerts',
        hint: 'Drop notifications screenshot',
        pathHint: 'landing/why-alerts.png',
      },
    ],
  },
  {
    id: 'scale',
    tab: 'Scale seats',
    icon: 'users',
    title: 'Start free, grow seats when the company does',
    description:
      'Invite the team on Free, then move to Basic, Plus, or Pro when you need more seats and fuller cost tooling. Plans match how companies actually expand — not how software vendors want you to buy.',
    points: [
      'Free plan to try with a small team',
      'Paid plans unlock seats and richer cost views',
      'Invite flow with role-based access from day one',
    ],
    screens: [
      {
        title: 'Invite seats',
        hint: 'Drop invites screenshot',
        pathHint: 'landing/why-invites.png',
      },
      {
        title: 'Roles',
        hint: 'Drop roles screenshot',
        pathHint: 'landing/why-roles.png',
      },
      {
        title: 'Plans',
        hint: 'Drop billing screenshot',
        pathHint: 'landing/why-plans.png',
      },
    ],
  },
  {
    id: 'decisions',
    tab: 'Better decisions',
    icon: 'chart-column',
    title: 'Reports built for company reviews',
    description:
      'Cost, progress, and team load views are ready for leadership meetings — so you spend the review on decisions, not assembling slides from three tools.',
    points: [
      'Progress and cost in the same report language',
      'Team load visibility for capacity calls',
      'Export-ready summaries when stakeholders need a file',
    ],
    screens: [
      {
        title: 'Cost report',
        hint: 'Drop reports screenshot',
        pathHint: 'landing/why-reports.png',
      },
      {
        title: 'Team load',
        hint: 'Drop capacity screenshot',
        pathHint: 'landing/why-capacity.png',
      },
      {
        title: 'Monthly review',
        hint: 'Drop review screenshot',
        pathHint: 'landing/why-review.png',
      },
    ],
  },
]

export const mechanismSteps = [
  { label: 'Projects', value: '12 active', tone: 'info' },
  { label: 'Time logged', value: '248 hrs', tone: 'success' },
  { label: 'Month cost', value: '₹4.2L', tone: 'warning' },
  { label: 'At risk', value: '2 projects', tone: 'danger' },
]

export const featureData = [
  {
    icon: 'layout-dashboard',
    title: 'Dashboard',
    description: 'See active projects, profit and loss, and overdue work in one company view.',
  },
  {
    icon: 'briefcase',
    title: 'Projects',
    description: 'Organize client work with members, progress, and status from start to delivery.',
  },
  {
    icon: 'boxes',
    title: 'Features',
    description: 'Break projects into features so scope and ownership stay clear for the team.',
  },
  {
    icon: 'columns-3',
    title: 'Tasks',
    description: 'Run day-to-day work on a board with assignees, due dates, and status.',
  },
  {
    icon: 'clock',
    title: 'Time logs',
    description: 'Capture hours against tasks so labor cost rolls up without spreadsheet chase.',
  },
  {
    icon: 'indian-rupee',
    title: 'Cost tracking',
    description: 'Watch budgets, thresholds, and monthly spend before a project slips.',
  },
  {
    icon: 'users',
    title: 'Roles & seats',
    description: 'Invite Admin, Team Leader, and Member seats with plan limits enforced.',
  },
  {
    icon: 'chart-column',
    title: 'Reports',
    description: 'Review cost, progress, and team load with views built for company decisions.',
  },
  {
    icon: 'bell',
    title: 'Notifications',
    description: 'Stay on invites, overdue tasks, and budget warnings without leaving Velorak.',
  },
]

export const howItWorks = [
  {
    step: '1',
    title: 'Create your company',
    description: 'Register as admin, pick a plan, and land in your company workspace.',
  },
  {
    step: '2',
    title: 'Invite the team',
    description: 'Send seat invites with roles so leaders and members join with the right access.',
  },
  {
    step: '3',
    title: 'Track work and cost',
    description: 'Ship features and tasks while time logs feed live budget visibility.',
  },
]

export const rolesData = [
  {
    icon: 'shield-check',
    title: 'Admin',
    description: 'Owns company settings, seats, plans, clients, and full budget visibility.',
  },
  {
    icon: 'user-cog',
    title: 'Team Leader',
    description: 'Runs projects and features, assigns work, and keeps delivery on schedule.',
  },
  {
    icon: 'user',
    title: 'Member',
    description: 'Updates tasks, logs time, and focuses on assigned delivery work.',
  },
]

export const screenshotSlots = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    hint: 'Replace with dashboard screenshot',
    pathHint: 'src/assets/images/landing/dashboard.png',
    description:
      'Company-wide view of active projects, profit and loss, and work that needs attention — so leaders see delivery and cost together.',
    points: ['Project health at a glance', 'Profit / loss trends', 'Overdue work spotlight'],
  },
  {
    id: 'tasks',
    title: 'Tasks board',
    hint: 'Replace with tasks / Kanban screenshot',
    pathHint: 'src/assets/images/landing/tasks.png',
    description:
      'Move features into day-to-day tasks with assignees, due dates, and status — the board your team actually works from.',
    points: ['Kanban-style status flow', 'Assignees & due dates', 'Clear ownership'],
  },
  {
    id: 'cost',
    title: 'Cost tracking',
    hint: 'Replace with budget / cost screenshot',
    pathHint: 'src/assets/images/landing/cost.png',
    description:
      'Time logs roll into budgets and thresholds so cost risk shows up before a project slips.',
    points: ['Budget vs spend', 'Threshold warnings', 'Labor cost from time logs'],
  },
  {
    id: 'reports',
    title: 'Reports',
    hint: 'Replace with reports screenshot',
    pathHint: 'src/assets/images/landing/reports.png',
    description:
      'Decision-ready views for cost, progress, and team load — built for company reviews, not spreadsheet exports.',
    points: ['Cost & progress reports', 'Team load visibility', 'Export-ready summaries'],
  },
]

/** Matches backend/src/constants/plans.js PLAN_DISPLAY */
export const pricingData = [
  {
    id: 'free',
    name: 'Free',
    priceInr: 0,
    seats: 5,
    description: 'Try Velorak with a small team',
    btnClass: 'btn-outline-primary',
    isPopular: false,
    features: [
      { title: '5 team seats', included: true },
      { title: 'Projects, features & tasks', included: true },
      { title: 'Time logs', included: true },
      { title: 'Basic cost view', included: true },
      { title: 'Priority support', included: false },
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    priceInr: 2499,
    seats: 15,
    description: 'Growing teams tracking delivery cost',
    btnClass: 'btn-primary',
    isPopular: true,
    features: [
      { title: '15 team seats', included: true },
      { title: 'Full cost tracking', included: true },
      { title: 'Roles & invites', included: true },
      { title: 'Reports', included: true },
      { title: 'Email notifications', included: true },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    priceInr: 6599,
    seats: 50,
    description: 'Larger companies with more seats',
    btnClass: 'btn-outline-primary',
    isPopular: false,
    features: [
      { title: '50 team seats', included: true },
      { title: 'Everything in Basic', included: true },
      { title: 'Advanced reports', included: true },
      { title: 'Budget thresholds', included: true },
      { title: 'Priority support', included: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceInr: 12499,
    seats: null,
    description: 'Unlimited seats for scaled operations',
    btnClass: 'btn-dark',
    isPopular: false,
    features: [
      { title: 'Unlimited seats', included: true },
      { title: 'Everything in Plus', included: true },
      { title: 'Company-wide visibility', included: true },
      { title: 'Highest limits', included: true },
      { title: 'Priority support', included: true },
    ],
  },
]

export const faqData = [
  {
    question: 'What is included in the Free plan?',
    answer: 'Free includes 5 seats so you can create a company, invite a small team, and start tracking projects, features, tasks, and time. Paid plans unlock more seats and fuller cost tooling.',
  },
  {
    question: 'How do seats and invites work?',
    answer: 'Your plan sets a seat limit. Admins invite employees by email with a role. Invitees accept the invite, set a password, and join the company.',
  },
  {
    question: 'What happens on paid plans?',
    answer: 'After registration on Basic, Plus, or Pro, you complete payment to activate the plan. Until payment confirms, the company stays pending activation.',
  },
  {
    question: 'Who should use Velorak?',
    answer: 'Companies that need project delivery and cost visibility together — not just a task board, and not a finance tool that ignores the work.',
  },
]

export const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', url: '#features' },
      { name: 'Why Velorak', url: '#why' },
      { name: 'How it works', url: '#how' },
      { name: 'Pricing', url: '#plans' },
      { name: 'FAQ', url: '#faq' },
    ],
  },
  {
    title: 'Account',
    links: [
      { name: 'Sign in', url: '/auth/sign-in' },
      { name: 'Start free', url: '/auth/sign-up' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Velorak', url: '#product' },
      { name: 'Contact', url: 'mailto:hello@velorak.com' },
    ],
  },
]
