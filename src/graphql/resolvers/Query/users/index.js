const { name } = require("./about.js")

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
  [name]:{
    async department(root, args, { db: { collections }}){
      const entry = await collections["division"].findOne({ where: { id: root.department }})
      if(entry) return entry
      const entry2 = await collections["department"].findOne({ where: { id: root.department }})
      return entry2
    },
    async type(root, args, { db: { collections }}){
      const entry = await collections["role"].findOne({ where: { id: root.type }})
      return entry
    }
  }
}

export { list, single, listDeleted, nested };
