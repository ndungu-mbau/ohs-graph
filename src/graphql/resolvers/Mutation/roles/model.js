import Waterline from "waterline"
const { name: identity } = require("./about")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    name: { type: "string", required: true },
    permissions: { type: "string", required: true },
    isDeleted: { type: 'boolean', defaultsTo: false }
  }
})