import { ObjectId } from "mongodb"
import firebase from "../../../../utils/firebase"
const { name } = require("./about")

const { UserError } = require("graphql-errors");

const create = async (data, { db: { collections } }) => {
  const id = new ObjectId().toHexString();
  const logId = new ObjectId().toHexString()
  const entry = Object.assign(data[name], { id, isDeleted: false });
  const logEntry = { id: logId, status: id, type: entry.type, datetime: new Date().toISOString(), isDeleted: false }

  try {
    await collections[name].destroyOne({ where: { job: entry.job }})
    await collections[name].create(entry);

    await collections["log"].create(logEntry)

    return entry;
  } catch (err) {
    throw new UserError(err.details);
  }
};

const update = async (data, { db: { collections } }) => {
  const { id } = data[name];
  const entry = data[name];

  const logId = new ObjectId().toHexString()
  const logEntry = { id: logId, status: id, type: entry.type, datetime: new Date().toISOString(), isDeleted: false }

  try {
    delete entry.id;

    await collections[name].update({ id }).set(entry);
    await collections["log"].create(logEntry)

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