var commonStorePath = 'http://172.104.61.150/learning/common/uploads'
module.exports = {
  sms: {
    fromNo: "HARKLM",
    key: "283326AQZpciYRUS5e4e4f0bP1",
    route: "4"
  },
  jwt: {
    expirySeconds: 60 * 60
  },
  gateway: {
    url: "http://localhost:8000"
  },
  profile: {
    imageBase: commonStorePath + 'profile/'
  },
  otp: {
    expirySeconds: 2 * 60
  },
  feeds: {
    basePath: commonStorePath + '/images/books/categories/'
  }
}
