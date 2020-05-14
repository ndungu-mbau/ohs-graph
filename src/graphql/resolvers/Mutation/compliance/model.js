import Waterline from "waterline"
const { name: identity } = require("./about")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    ppe: { type: "string", required: true },
    induction: { type: "string", required: true },
    toolbox: { type: "string", required: true },
    erp: { type: "string", required: true },
    first_aid: { type: "string", required: true },
    extinguisher: { type: "string", required: true },
    jha: { type: "string", required: true },
    documents: { type: "string", required: true },
    job: { type: "string", required: true },
    isDeleted: { type: "boolean", defaultsTo: false }
  }
})