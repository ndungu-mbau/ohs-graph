import * as admin from 'firebase-admin'
import serviceAccount from "./adrian-ohs-system-firebase.json"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://adrian-ohs-system.firebaseio.com",
  storageBucket: "adrian-ohs-system.appspot.com"
});

function mediaLinkToDownloadableUrl(object) {
  var [firstPartUrl, secondPartUrl] = object.mediaLink.split("?")

  firstPartUrl = firstPartUrl.replace("https://storage.googleapis.com/download/storage", "https://firebasestorage.googleapis.com")
  firstPartUrl = firstPartUrl.replace("v1", "v0")

  firstPartUrl += "?alt=media"

  return firstPartUrl
}


const messaging = admin.messaging()
const storage = admin.storage()

export default {
  async send({ notification = { title: "Notification", body: "Your new notification" }, data, token } = {}){
    const message = {
      notification,
      data,
      token,
      // android: {
      //   ttl: "86400s",
      // },
      // webpush: {
      //   headers: {
      //     TTL: "86400"
      //   }
      // }
    }
    try{
      const res = await messaging.send(message)
      return res
    } catch(err) {
      console.log(err)
    }
  },
  async upload({ file }){
    const bucket = storage.bucket()
    const res = await bucket.upload(file.path)
    const url = mediaLinkToDownloadableUrl(res[0].metadata)
    return { url }
  }
}