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
    imageBase: commonPath + 'common/uploads/profile/images/',
       imageUploadPath: 'common/uploads/profile/images/',
      // audioUploadPath: '/var/www/html/filmy/common/uploads/profiles/',


  },
  otp: {
    expirySeconds: 2 * 60
  },
  // feeds: {
  //     resultsPerPage: 30,
  //     // imageUploadPath: '/var/www/html/filmy/common/uploads/feeds/images/',
  //     // videoUploadPath: '/var/www/html/filmy/common/uploads/feeds/videos/',
  //     // audioUploadPath: '/var/www/html/filmy/common/uploads/feeds/audios/',

  //      imageUploadPath: 'common/uploads/feeds/images/',
  //     videoUploadPath: 'common/uploads/feeds/videos/',
  //     audioUploadPath: 'common/uploads/feeds/audios/',

  //     // documentUploadPath: relativeCommonPath + "feeds/documents",
  //     imageBase: commonPath + "common/uploads/feeds/images/",
  //     videoBase: commonPath + "common/uploads/feeds/videos/",
  //     audioBase: commonPath + "common/uploads/feeds/audios/",
  //     // documentBase: commonPath + "feeds/documents/",
  //     // documentImage: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/pdf.png",
  //     maxImagesCount: 10,
  //     maxVideosCount: 10,
  //     maxAudiosCount: 10,
  //     emotionsList: ["like","love", "happy", "heartfilled", "surprise", "sad", "angry"]

  // },
  feeds: {
    resultsPerPage: 30,
    imageUploadPath: relativeCommonPath + "feeds/images",
    imageUploadPath: '/var/www/html/filmy/common/uploads/feeds/images/',
    videoUploadPath: '/var/www/html/filmy/common/uploads/feeds/videos/',
    audioUploadPath: '/var/www/html/filmy/common/uploads/feeds/audios/',



    // documentUploadPath: relativeCommonPath + "feeds/documents",
    imageBase: commonPath + "common/uploads/feeds/images/",
    videoBase: commonPath + "common/uploads/feeds/videos/",
    audioBase: commonPath + "common/uploads/feeds/audios/",
    // documentBase: commonPath + "feeds/documents/",
    // documentImage: "http://trackflyvehicle.com/edunet-web/ftp/edunet-admin-portal/backend/img/pdf.png",
    maxImagesCount: 10,
    maxVideosCount: 10,
    maxAudiosCount: 10,
    emotionsList: ["like","love", "happy", "heartfilled", "surprise", "sad", "angry"],

},
autocomplete : {
limit : 6
},
users : {
  resultsPerPage: 30

}
}
