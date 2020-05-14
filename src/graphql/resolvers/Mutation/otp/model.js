import Waterline from "waterline"
const { name: identity } = require("./about")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    code: { type: "string", required: true },
    user: { type: "string", required: true },
    used: { type: "boolean", defaultsTo: false },
    isDeleted: { type: "boolean", defaultsTo: false }
  }
})