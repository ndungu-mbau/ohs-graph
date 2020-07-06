import { ObjectId } from "mongodb"
import firebase from "../../../../utils/firebase"
import sms from "../../../../utils/sms"
const { name } = require("./about.js")

const { UserError } = require("graphql-errors");

const create = async (data, { db: { collections }, user }) => {
  const id = new ObjectId().toHexString();
  const statusId = new ObjectId().toHexString()
  const logId = new ObjectId().toHexString()
  const entry = Object.assign(data[name], { id, author: user.id, isDeleted: false });
  const statusEntry = { id: statusId, type: "NEW", job: id }
  const logEntry = { id: logId, type: statusEntry.type, status: statusId, datetime: new Date().toISOString(), isDeleted: false}

  entry.location = JSON.stringify(entry.location)

  try {
    const technician = await collections["user"].findOne({ where: { id: entry.technician }})

    await collections[name].create(entry);
    await collections["status"].create(statusEntry)
    await collections["log"].create(logEntry)

    await firebase.send({
      notification: {
        title: "New Job",
        body: `You have been assigned a new job, ${entry.name}`
      },
      token: technician.fcm
    })

    sms({
      data: {
        message: `You have been assigned a new job, ${entry.name}`,
        phone: technician.phone
      }
    })


    return entry;
  } catch (err) {
    console.log(err)
    throw new UserError(err.details);
  }
};

const update = async (data, { db: { collections } }) => {
  const { id } = data[name];
  const entry = Object.assign({}, data[name]);

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
    await collections[name].archiveOne({ id });

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
