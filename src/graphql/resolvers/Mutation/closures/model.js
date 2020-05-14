import Waterline from "waterline"
const { name: identity } = require("./about")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    closuretype: { type: "string", required: true },
    job: { type: 'string', required: true },
    amount: { type: "number", required: true },
    isDeleted: { type: 'boolean', defaultsTo: false }
  }
})