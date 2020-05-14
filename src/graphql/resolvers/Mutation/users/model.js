var Waterline = require("waterline");
const { name: identity } = require("./about.js")

export default Waterline.Collection.extend({
  identity,
  datastore: "default",
  primaryKey: "id",

  attributes: {
    id: { type: "string", required: true },
    name: { type: "string", required: true },
    phone: { type: "string", required: true },
    department: { type: "string" },
    type: { type: "string", required: true },
    fcm: { type: "string" },
    password: { type: "string", required: true },
    profile: { type: "string", defaultsTo: "../assets/img/theme/default.png" },
    isDeleted: { type: "boolean", defaultsTo: false }
  }
});
