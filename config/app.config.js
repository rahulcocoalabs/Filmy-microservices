var commonStorePath = "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/common/uploads/";
var commonPath = 'http://172.104.61.150/filmy/'
var relativeCommonPath = "../filmy/common/uploads/";

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
      resultsPerPage: 30,
      // imageUploadPath: relativeCommonPath + "feeds/images",
      // imageUploadPath: '/var/www/html/filmy/common/uploads/feeds/images/',
      // videoUploadPath: '/var/www/html/filmy/common/uploads/feeds/videos/',
       imageUploadPath: 'common/uploads/feeds/images/',
      videoUploadPath: 'common/uploads/feeds/videos/',
      // documentUploadPath: relativeCommonPath + "feeds/documents",
      imageBase: commonPath + "/common/uploads/feeds/images/",
      videoBase: commonPath + "/common/uploads/feeds/videos/",
      // documentBase: commonPath + "feeds/documents/",
      // documentImage: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/pdf.png",
      maxImageCount: 10,
      maxVideoCount: 1,
      maxDocumentsCount: 10
  }
}
