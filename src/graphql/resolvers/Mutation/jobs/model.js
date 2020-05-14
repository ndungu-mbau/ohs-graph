var Waterline = require("waterline");
const { name: identity } = require("./about.js")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    name: { type: "string", required: true },
    scope : { type: "string", required: true },
    technician: { type: "string", required: true },
    ohs: { type: "string", required: true },
    author: { type: "string", required: true },
    location: { type: "string", required: true },
    location_name: { type: "string", required: true },
    isDeleted: { type: "boolean", defaultsTo: false }
  }
});
