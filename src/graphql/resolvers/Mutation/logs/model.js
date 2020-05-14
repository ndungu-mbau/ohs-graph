var Waterline = require("waterline");
const { name: identity } = require("./about")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    status: { type: "string", required: true },
    type : { type: "string", required: true },
    datetime : { type: "string", required: true },
    isDeleted: { type: "boolean", defaultsTo: false }
  }
});
