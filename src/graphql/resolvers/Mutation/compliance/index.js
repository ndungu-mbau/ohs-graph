import { ObjectId } from "mongodb"
import firebase from "../../../../utils/firebase"
import sms from "../../../../utils/sms"
const { name } = require("./about")

const { UserError } = require("graphql-errors");

const create = async (data, { db: { collections } }) => {
  const id = new ObjectId().toHexString();
  const entry = Object.assign(data[name], { id, isDeleted: false });
  entry.jha = entry.jha.join(",")
  entry.documents = entry.documents.join(",")

  try {
    const status = await collections["status"].findOne({ where: { job: entry.job }})
    const job = await collections["job"].findOne({ where: { id: entry.job }})
    const author = await collections["user"].findOne({ where: { id: job.author }})

    await collections[name].destroyOne({ where: { job: entry.job }})
    await collections["approval"].destroy({ where: { job: entry.job }})
    await collections[name].create(entry);
    await collections["status"].update({ id: status.id }).set({ type: "ACCEPTED" })

    await collections["log"].create({ id: new ObjectId().toHexString(), status: status.id, type: "ACCEPTED", datetime: new Date().toISOString() })

    await firebase.send({
      notification: {
        title: "Job Pending Approval",
        body: `Job ${job.name} has been accepted, pending level 1 approval`
      },
      token: author.fcm
    })

    sms({
      data: {
        phone: author.phone,
        message: `Job ${job.name} has been accepted, pending level 1 approval`
      }
    })

    return entry;
  } catch (err) {
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