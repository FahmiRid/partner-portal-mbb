// mocks/handlers.js
import { rest } from 'msw';

// Mock data for the dashboard
const mockData = {
  stats: {
    totalUsers: 12583,
    activeUsers: 8742,
    conversionRate: 4.5,
    avgSessionTime: '18:32',
    revenue: '$87,432',
    orders: 1254
  },
  
  userGrowth: {
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'New Users',
          data: [42, 56, 48, 61, 57, 38, 27],
          backgroundColor: 'rgba(66, 133, 244, 0.6)',
          borderColor: 'rgba(66, 133, 244, 1)',
          borderWidth: 2,
          tension: 0.4
        },
        {
          label: 'Active Users',
          data: [38, 52, 45, 58, 54, 33, 22],
          backgroundColor: 'rgba(52, 168, 83, 0.6)',
          borderColor: 'rgba(52, 168, 83, 1)',
          borderWidth: 2,
          tension: 0.4
        }
      ]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'New Users',
          data: [320, 420, 390, 450, 520, 600],
          backgroundColor: 'rgba(66, 133, 244, 0.6)',
          borderColor: 'rgba(66, 133, 244, 1)',
          borderWidth: 2,
          tension: 0.4
        },
        {
          label: 'Active Users',
          data: [290, 350, 330, 420, 490, 580],
          backgroundColor: 'rgba(52, 168, 83, 0.6)',
          borderColor: 'rgba(52, 168, 83, 1)',
          borderWidth: 2,
          tension: 0.4
        }
      ]
    },
    yearly: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          label: 'New Users',
          data: [1200, 2400, 3800, 5200, 8500, 12600],
          backgroundColor: 'rgba(66, 133, 244, 0.6)',
          borderColor: 'rgba(66, 133, 244, 1)',
          borderWidth: 2,
          tension: 0.4
        },
        {
          label: 'Active Users',
          data: [1000, 2100, 3400, 4800, 7900, 11200],
          backgroundColor: 'rgba(52, 168, 83, 0.6)',
          borderColor: 'rgba(52, 168, 83, 1)',
          borderWidth: 2,
          tension: 0.4
        }
      ]
    }
  },
  
  userDistribution: {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [{
      data: [55, 35, 10],
      backgroundColor: [
        'rgba(66, 133, 244, 0.7)',
        'rgba(219, 68, 55, 0.7)',
        'rgba(244, 180, 0, 0.7)'
      ],
      borderColor: [
        'rgba(66, 133, 244, 1)',
        'rgba(219, 68, 55, 1)',
        'rgba(244, 180, 0, 1)'
      ],
      borderWidth: 1
    }]
  },
  
  revenueData: {
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Revenue',
        data: [1850, 2100, 1950, 2300, 2500, 1800, 1300],
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: 'rgba(66, 133, 244, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [12500, 14000, 13200, 15600, 18200, 21000],
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: 'rgba(66, 133, 244, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    yearly: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [{
        label: 'Revenue',
        data: [145000, 189000, 235000, 312000, 458000, 687000],
        backgroundColor: 'rgba(66, 133, 244, 0.2)',
        borderColor: 'rgba(66, 133, 244, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    }
  },
  
  conversionRate: {
    weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Conversion Rate (%)',
        data: [3.1, 3.4, 3.2, 3.7, 3.9, 3.5, 3.0],
        backgroundColor: 'rgba(244, 180, 0, 0.6)',
        borderColor: 'rgba(244, 180, 0, 1)',
        borderWidth: 2
      }]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Conversion Rate (%)',
        data: [3.2, 3.5, 3.8, 4.1, 4.5, 5.0],
        backgroundColor: 'rgba(244, 180, 0, 0.6)',
        borderColor: 'rgba(244, 180, 0, 1)',
        borderWidth: 2
      }]
    },
    yearly: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [{
        label: 'Conversion Rate (%)',
        data: [2.1, 2.5, 3.0, 3.5, 4.0, 4.5],
        backgroundColor: 'rgba(244, 180, 0, 0.6)',
        borderColor: 'rgba(244, 180, 0, 1)',
        borderWidth: 2
      }]
    }
  },
  
  userEngagement: {
    labels: ['0-5 min', '5-15 min', '15-30 min', '30+ min'],
    datasets: [{
      data: [30, 35, 25, 10],
      backgroundColor: [
        'rgba(66, 133, 244, 0.7)',
        'rgba(52, 168, 83, 0.7)',
        'rgba(251, 188, 5, 0.7)',
        'rgba(219, 68, 55, 0.7)'
      ],
      borderColor: [
        'rgba(66, 133, 244, 1)',
        'rgba(52, 168, 83, 1)',
        'rgba(251, 188, 5, 1)',
        'rgba(219, 68, 55, 1)'
      ],
      borderWidth: 1
    }]
  },
  
  recentActivity: [
    {
      id: 1,
      title: 'New user registered',
      description: 'John Smith joined the platform',
      time: '2m ago',
      icon: 'user-plus',
      iconColor: 'primary'
    },
    {
      id: 2,
      title: 'New order placed',
      description: 'Order #12345 - $230.00',
      time: '15m ago',
      icon: 'shopping-cart',
      iconColor: 'success'
    },
    {
      id: 3,
      title: 'New review received',
      description: 'Jane Doe left a 5-star review',
      time: '1h ago',
      icon: 'star',
      iconColor: 'warning'
    },
    {
      id: 4,
      title: 'System alert',
      description: 'Server load reached 85%',
      time: '3h ago',
      icon: 'exclamation-triangle',
      iconColor: 'danger'
    }
  ]
};

// MSW REST API handlers
export const handlers = [
  // Get stats
  rest.get('/api/stats', (req, res, ctx) => {
    return res(
      ctx.delay(500), // Add realistic delay
      ctx.status(200),
      ctx.json(mockData.stats)
    );
  }),
  
  // Get user growth data
  rest.get('/api/user-growth', (req, res, ctx) => {
    const period = req.url.searchParams.get('period') || 'monthly';
    return res(
      ctx.delay(700),
      ctx.status(200),
      ctx.json(mockData.userGrowth[period] || mockData.userGrowth.monthly)
    );
  }),
  
  // Get user distribution data
  rest.get('/api/user-distribution', (req, res, ctx) => {
    return res(
      ctx.delay(600),
      ctx.status(200),
      ctx.json(mockData.userDistribution)
    );
  }),
  
  // Get revenue data
  rest.get('/api/revenue', (req, res, ctx) => {
    const period = req.url.searchParams.get('period') || 'monthly';
    return res(
      ctx.delay(800),
      ctx.status(200),
      ctx.json(mockData.revenueData[period] || mockData.revenueData.monthly)
    );
  }),
  
  // Get conversion rate data
  rest.get('/api/conversion', (req, res, ctx) => {
    const period = req.url.searchParams.get('period') || 'monthly';
    return res(
      ctx.delay(600),
      ctx.status(200),
      ctx.json(mockData.conversionRate[period] || mockData.conversionRate.monthly)
    );
  }),
  
  // Get user engagement data
  rest.get('/api/user-engagement', (req, res, ctx) => {
    return res(
      ctx.delay(500),
      ctx.status(200),
      ctx.json(mockData.userEngagement)
    );
  }),
  
  // Get recent activity data
  rest.get('/api/recent-activity', (req, res, ctx) => {
    const limit = parseInt(req.url.searchParams.get('limit') || '4');
    return res(
      ctx.delay(400),
      ctx.status(200),
      ctx.json(mockData.recentActivity.slice(0, limit))
    );
  })
];