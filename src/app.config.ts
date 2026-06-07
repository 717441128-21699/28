export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/publish/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/appointment/index',
    'pages/deposit/index',
    'pages/transfer/index',
    'pages/loan/index',
    'pages/insurance/index',
    'pages/claim/index',
    'pages/vip/index',
    'pages/dispute/index',
    'pages/admin/index',
    'pages/login/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '车易拍',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#1E6FFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
