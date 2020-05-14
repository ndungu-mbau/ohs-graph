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
  const { id } = args[name];

  const entry = await collections[name].findOne({
    where: { id, isDeleted: false }
  });
  return entry;
};

const nested = {
  [name]: {
    approver: async (root, args, { db: { collections }}) => {
      const entry = await collections["user"].findOne({ where : { id: root.approver }})
      return entry
    },
    job: async (root, args, { db: { collections }}) => {
      const entry = await collections["job"].findOne({ where : { id: root.job }})
      return entry
    },
  }
}

export { list, single, listDeleted, nested };
