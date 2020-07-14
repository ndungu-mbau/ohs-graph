var Waterline = require("waterline");
const { name: identity } = require("./about.js")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    name: { type: "string", required: true },
    division : { type: "string", required: true },
    manager: { type: "string", required: true },
    ohs: { type: "string", required: true },
    isDeleted: { type: "boolean", defaultsTo: false }
  }
});
