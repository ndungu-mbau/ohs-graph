require("babel-polyfill")
import express from "express"
import morgan from "morgan"
import cors from "cors"
import bodyParser from "body-parser"
import { ObjectId } from "mongodb"
import sha1 from "sha1"
import multer from "multer"

import graphRouter from "./index"
import { authMiddleware, router as authRouter } from "./auth"
import storage from "./storage"
import firebase from "./utils/firebase"
import { upload as uploadFile } from "./utils/oracle"

const { NODE_ENV, PORT = 3000, SYSADMIN_PHONE, SYSADMIN_NAME, SYSADMIN_PASSWORD } = process.env
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, './tmp')
    },
    filename(req, file, cb) {
      const [...filename, ext] = file.originalname.split(".")
      console.log(filename.join(""), filename.join("").replace(" ", "-"))
      cb(null, `${filename.join("").replace(" ", "-")}--${Date.now()}.${ext}`)
    }
  })
})

var app = express()

if (NODE_ENV !== "test") app.use(morgan("combined"), cors());

const attatchRouter = async () => {
  const db = await storage
  const sysAdmin = await db.collections["user"].findOne({ where: { phone: SYSADMIN_PHONE }})

  if(!sysAdmin){
    const sysadminId = new ObjectId().toHexString()
    const divId = new ObjectId().toHexString()
    const typeId = new ObjectId().toHexString()

    const diventry = {
      id: divId,
      name: "OHS",
      description: "Health and Safety Division",
      hod: sysadminId,
      ohs: sysadminId
    }

    const typeentry = {
      id: typeId,
      name: "OHS",
      permissions: "OHS,HOD"
    }

    const userentry = {
      id: sysadminId,
      name: SYSADMIN_NAME,
      phone: SYSADMIN_PHONE,
      department: divId,
      type: typeId,
      password: sha1(SYSADMIN_PASSWORD),
      isDeleted: false
    }

    await db.collections["division"].create(diventry)
    await db.collections["user"].create(userentry)
    await db.collections["role"].create(typeentry)
  }

  Object.assign(app.locals, { db })
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json('*/*'))
  app.get("/health", (req, res) => res.json({ ok: true, message: "welcome to graph api" }));
  app.use("/auth", authRouter)
  app.use("/", authMiddleware, graphRouter)
  app.use("/upload", authMiddleware, upload.single('file'), uploadFile)
}

attatchRouter()

if(NODE_ENV !== "test"){
  app.listen(PORT, () => console.log(`Project running on port ${PORT}! on ${NODE_ENV} mode.`))
}

export default app
