// Ant Design Theme Configuration
export const lightTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorText: '#262626',
    colorTextSecondary: '#8c8c8c',
    colorBorder: '#d9d9d9',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
      triggerBg: '#002140',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: '#1890ff',
    },
    Card: {
      headerBg: 'transparent',
    },
    Table: {
      headerBg: '#fafafa',
    },
  },
};

export const darkTheme = {
  token: {
    colorPrimary: '#177ddc',
    colorSuccess: '#49aa19',
    colorWarning: '#d89614',
    colorError: '#d32029',
    colorInfo: '#177ddc',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#262626',
    colorBgLayout: '#141414',
    colorText: '#ffffffd9',
    colorTextSecondary: '#ffffff73',
    colorBorder: '#434343',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: '#1f1f1f',
      siderBg: '#1f1f1f',
      triggerBg: '#262626',
    },
    Menu: {
      darkItemBg: '#1f1f1f',
      darkSubMenuItemBg: '#141414',
      darkItemSelectedBg: '#177ddc',
    },
    Card: {
      headerBg: 'transparent',
    },
    Table: {
      headerBg: '#262626',
    },
  },
};

// Role-based theme colors
export const roleColors = {
  super_admin: {
    primary: '#722ed1', // Purple
    gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
  },
  main_branch_admin: {
    primary: '#1890ff', // Blue
    gradient: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
  },
  branch_admin: {
    primary: '#13c2c2', // Cyan
    gradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
  },
  teacher: {
    primary: '#52c41a', // Green
    gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
  },
  staff: {
    primary: '#fa8c16', // Orange
    gradient: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
  },
  student: {
    primary: '#eb2f96', // Pink
    gradient: 'linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)',
  },
  parent: {
    primary: '#2f54eb', // Geek Blue
    gradient: 'linear-gradient(135deg, #2f54eb 0%, #597ef7 100%)',
  },
};

