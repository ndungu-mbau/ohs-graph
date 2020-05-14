var Waterline = require("waterline");
const { name: identity } = require("./about")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    level: { type: "string", required: true },
    approver : { type: "string", required: true },
    status : { type: "string", required: true },
    reason : { type: "string" },
    job : { type: "string", required: true },
    isDeleted: { type: "boolean", defaultsTo: false }
  }
});
