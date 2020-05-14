import Waterline from "waterline"
import DiskAdapter from "sails-disk"
import MongoAdapter from "sails-mongo"

//Import Models
import user from "./graphql/resolvers/Mutation/users/model"
import role from "./graphql/resolvers/Mutation/roles/model"
import division from "./graphql/resolvers/Mutation/divisions/model"
import department from "./graphql/resolvers/Mutation/departments/model"
import scope from "./graphql/resolvers/Mutation/scopes/model"
import job from "./graphql/resolvers/Mutation/jobs/model"
import otp from "./graphql/resolvers/Mutation/otp/model"
import control from "./graphql/resolvers/Mutation/controls/model"
import hazard from "./graphql/resolvers/Mutation/hazards/model"
import compliance from "./graphql/resolvers/Mutation/compliance/model"
import status from "./graphql/resolvers/Mutation/status/model"
import approval from "./graphql/resolvers/Mutation/approvals/model"
import closuretype from "./graphql/resolvers/Mutation/closure-types/model"
import closure from "./graphql/resolvers/Mutation/closures/model"
import document from "./graphql/resolvers/Mutation/documents/model"
import log from "./graphql/resolvers/Mutation/logs/model"

const { NODE_ENV, DB_URL } = process.env

var waterline = new Waterline()

waterline.registerModel(user)
waterline.registerModel(role)
waterline.registerModel(department)
waterline.registerModel(division)
waterline.registerModel(scope)
waterline.registerModel(job)
waterline.registerModel(otp)
waterline.registerModel(control)
waterline.registerModel(hazard)
waterline.registerModel(compliance)
waterline.registerModel(status)
waterline.registerModel(approval)
waterline.registerModel(closuretype)
waterline.registerModel(closure)
waterline.registerModel(document)
waterline.registerModel(log)

var config = {
  adapters: {
    mongo: MongoAdapter,
    disk: DiskAdapter,
  },
  datastores: {
    default: ['development', "test"].includes(NODE_ENV) ? {
      adapter: 'mongo',
      url: DB_URL
    } : {
      adapter: "disk",
      // filePath: '/tmp'
    }
  }
};

export default new Promise((resolve, reject) => {
  waterline.initialize(config, (err, db) => {
    if (err) {
      console.log(err)
      reject(err)
    }
    resolve(db)
  })
})