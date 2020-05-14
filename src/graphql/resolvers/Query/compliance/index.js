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
    jha: async (root, args, { db: { collections }}) => {
      const ids = root.jha.split(",")
      const entries = ids.map(async id => await collections["hazard"].findOne({ where : { id }}))
      return entries
    },
    job: async (root, args, { db: { collections }}) => {
      const entry = await collections["control"].findOne({ where : { id: root.job }})
      return entry
    },
    documents: async (root, args, { db: { collections }}) => {
      const ids = root.documents.split(",")
      const entries = await Promise.all(ids.map(async id => await collections["document"].findOne({ where : { id }})))
      return entries
    },
  }
}

export { list, single, listDeleted, nested };
