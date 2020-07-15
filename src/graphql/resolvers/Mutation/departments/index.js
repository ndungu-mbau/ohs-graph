import { ObjectId } from "mongodb"
const { name } = require("./about")

const { UserError } = require("graphql-errors");

const create = async (data, { db: { collections } }) => {
  const id = new ObjectId().toHexString();
  const entry = Object.assign(data[name], { id, isDeleted: false });
  const { manager, ohs } = entry

  try {
    await collections[name].create(entry);
    
    const managerEntry = await collections["user"].findOne({ where: { id: manager }})
    const ohsEntry = await collections["user"].findOne({ where: { id: ohs }})

    await collections["user"].update({ id: managerEntry.id }).set({ department: id })
    await collections["user"].update({ id: ohsEntry.id }).set({ department: id })

    return entry;
  } catch (err) {
    throw new UserError(err.details);
  }
};

const update = async (data, { db: { collections } }) => {
  const { id } = data[name];
  const entry = Object.assign({}, data[name]);

  try {
    delete entry.id;

    await collections[name].update({ id }).set(entry);

    return entry;
  } catch (err) {
    throw new UserError(err.details);
  }
};

const archive = async (data, { db: { collections } }) => {
  const { id } = data[name];

  try {
    await collections[name].update({ id }).set({ isDeleted: true });

    return {
      id
    };
  } catch (err) {
    throw new UserError(err.details);
  }
};

const restore = async (data, { db: { collections } }) => {
  const { id } = data[name];

  try {
    await collections[name].update({ id }).set({ isDeleted: false });

    return {
      id
    };
  } catch (err) {
    throw new UserError(err.details);
  }
};

export default () => {
  return {
    create,
    update,
    archive,
    restore
  };
};
