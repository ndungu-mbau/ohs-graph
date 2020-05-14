import { ObjectId } from "mongodb"
const { name } = require("./about")

const { UserError } = require("graphql-errors");

const create = async (data, { db: { collections } }) => {
  const { closuretype, amount, job } = data[name]

  try {
    const entries = closuretype.map((type, i) => {
      const id = new ObjectId().toHexString()
      const entry = {
        job,
        closuretype: type,
        amount: amount[i],
        id,
        isDeleted: false
      }
      return entry
    })

    await collections[name].createEach(entries);

    return entries;
  } catch (err) {
    console.log(err)

    throw new UserError(err.details);
  }
};

const update = async (data, { db: { collections } }) => {
  const { id } = data[name];
  const entry = data[name];

  try {
    delete entry.id;

    await collections[name].update({ id }).set(entry);

    return {
      id
    };
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