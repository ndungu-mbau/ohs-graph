const { name } = require("./about")

const list = async (root, args, { db: { collections } }) => {
  const entries = await collections[name].find({
    where: {
      isDeleted: false
    }
  });
  return entries;
};

const listDeleted = async (root, args, { db: { collections } }) => {
  const entries = await collections[name].find({
    where: {
      isDeleted: true
    }
  });
  return entries;
};

const single = async (root, args, { db: { collections } }) => {
  const params = args[name];

  const entry = await collections[name].findOne({
    where: { id: params.id, isDeleted: false }
  });
  return entry;
};

const roleByPermission = async (root, args, { db: { collections } }) => {
  const params = args[name];

  const entries = await collections[name].find({
    where: { isDeleted: false }
  });

  const roles = entries
  .map(entry => Object.assign(entry, { permissions: entry.permissions.split(",")}))
  .filter(entry => params.permissions.every(perm => entry.permissions.includes(perm)))

  return roles.map(role => Object.assign(role, { permissions: role.permissions.join(",")}));
};

const nested = {
  [name]: {
    permissions: (root, args, ctx) => {
      return root.permissions.split(",")
    }
  }
}

export { list, single, listDeleted, roleByPermission, nested };
