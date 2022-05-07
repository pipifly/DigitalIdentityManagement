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
  { name: '创建 VC', icon: 'FileTextOutlined', path: '/createvc', component: './CreateVc'},
  {
    path: '/manage',
    name: '管理',
    icon: 'FormOutlined',
    routes: [
      { path: '/manage/createdvc', name: '创建的 VC', component: './ManageVc/CreatedVc' },
      { path: '/manage/holdedvc', name: '持有的 VC', component: './ManageVc/HoldedVc' },
      { component: './404' },
    ]
  },
  // { name: '查询表格', icon: 'table', path: '/list', component: './TableList' },
  // { name: 'Web3使用', icon: 'ApiOutlined', path: '/web3use', component: './Web3Use'},
  { name: '验证 VC', icon: 'FileDoneOutlined', path: '/verifyvc', component: './VerifyVc'},
  { path: '/', redirect: '/welcome' },
  { component: './404' },
];
