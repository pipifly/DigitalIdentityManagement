export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { name: '登录', path: '/user/login', component: './user/Login' },
      { component: './404' },
    ],
  },
  { path: '/welcome', name: '欢迎', icon: 'smile', component: './Welcome' },
  // {
  //   path: '/admin',
  //   name: '管理页',
  //   icon: 'crown',
  //   access: 'canAdmin',
  //   component: './Admin',
  //   routes: [
  //     { path: '/admin/sub-page', name: '二级管理页', icon: 'smile', component: './Welcome' },
  //     { component: './404' },
  //   ],
  // },
  // { name: '查询表格', icon: 'table', path: '/list', component: './TableList' },
  { name: 'Web3使用', icon: 'ApiOutlined', path: '/web3use', component: './Web3Use'},
  { name: '创建 VC', icon: 'FileTextOutlined', path: '/createvc', component: './CreateVc'},
  { name: '管理 VC', icon: 'FormOutlined', path: '/managevcs', component: './ManageVc'},
  { name: '验证 VC', icon: 'FileDoneOutlined', path: '/verifyvc', component: './VerifyVc'},
  { path: '/', redirect: '/welcome' },
  { component: './404' },
];
