import { ObjectId } from "mongodb"
import firebase from "../../../../utils/firebase"
import sms from "../../../../utils/sms"
const { name } = require("./about")

const { UserError } = require("graphql-errors");

const create = async (data, { db: { collections }, user: { id: approver } }) => {
  const id = new ObjectId().toHexString();
  const entry = Object.assign(data[name], { id, approver, isDeleted: false });

  console.log(entry)

  try {
    await collections[name].destroyOne({ where: { job: entry.job, level: entry.level }})
    await collections[name].create(entry);

    const roles = await collections["role"].find({ where: { isDeleted: false }})
    const tl_roles = roles.filter(role => role.permissions.includes("TEAM_LEAD")).map(role => role.id)


    const [job] = await collections["job"].find({ where: { id: entry.job }}).limit(1)
    const [status] = await collections["status"].find({ where: { job: entry.job }}).limit(1)
    const [scope] = await collections["scope"].find({ where: { id: job.scope }}).limit(1)
    const [department] = await collections["department"].find({ where: { id: scope.department }}).limit(1)
    const [division] = await collections["division"].find({ where: { id: department.division }}).limit(1)

    const [technician] = await collections["user"].find({ where: { id: job.technician }}).limit(1)
    const [pm] = await collections["user"].find({ where: { id: department.manager }}).limit(1)
    const dept_users = await collections["user"].find({ where: { department: department.id }})
    const team_leads = dept_users.filter(user => tl_roles.includes(user.type))
    const [hod] = await collections["user"].find({ where: { id: division.hod }}).limit(1)
    const [ohs] = await collections["user"].find({ where: { id: job.ohs }}).limit(1)

    if(entry.status === "REJECTED"){
      await collections["status"].update({ id: status.id }).set({ type: "REJECTED", reason: entry.reason })
      await collections["log"].create({ id: new ObjectId().toHexString(), status: status.id, type: "REJECTED", datetime: new Date().toISOString() })

      sms({ data: {
        phone: technician.phone,
        message: `Job ${job.name} approval was rejected.`
      }})
    }

    if(entry.level === "LVL_1" && entry.status !== "REJECTED"){
      await firebase.send({
        notification: {
          title: "Pending Approval",
          body: `You have a pending approval for job ${job.name} on level 2`
        },
        token: pm.fcm
      })

      sms({ data: {
        phone: pm.phone,
        message: `You have a pending approval for job ${job.name} on level 2`
      }})

      team_leads.forEach(async team_lead => {
        await firebase.send({
          notification: {
            title: "Pending Approval",
            body: `You have a pending approval for job ${job.name} on level 2`
          },
          token: team_lead.fcm
        })

        sms({ data: {
          phone: team_lead.phone,
          message: `You have a pending approval for job ${job.name} on level 2`
        }})
      })

    }

    if(entry.level === "LVL_2" && scope.hazard === "HIGH" && entry.status !== "REJECTED"){
      await firebase.send({
        notification: {
          title: "Pending Approval",
          body: `You have a pending approval for job ${job.name} on level 3`
        },
        token: hod.fcm
      })
      
      sms({ data: {
        phone: hod.phone,
        message: `You have a pending approval for job ${job.name} on level 3`
      }})
    } else if(entry.level === "LVL_2" && scope.hazard !== "HIGH" && entry.status !== "REJECTED"){
      await firebase.send({
        notification: {
          title: "Pending Approval",
          body: `You have a pending approval for job ${job.name} on level 4`
        },
        token: ohs.fcm
      })

      sms({
        data: {
          phone: ohs.phone,
          message: `You have a pending approval for job ${job.name} on level 4`
        }
      })
    }

    if(entry.level === "LVL_3" && entry.status !== "REJECTED"){
      await firebase.send({
        notification: {
          title: "Pending Approval",
          body: `You have a pending approval for job ${job.name} on level 4`
        },
        token: ohs.fcm
      })

      sms({
        data: {
          phone: ohs.phone,
          message: `You have a pending approval for job ${job.name} on level 4`
        }
      })
    }

    if(entry.level === "LVL_4" && entry.status !== "REJECTED"){
      await collections["status"].update({ id: status.id }).set({ type: "IN_PROGRESS" })
      await collections["log"].create({ id: new ObjectId().toHexString(), status: status.id, type: "IN_PROGRESS", datetime: new Date().toISOString() })

      await firebase.send({
        notification: {
          title: "Job Approved",
          body: `The job ${job.name} has been fully approved, and you can now proceed with the job`
        },
        token: technician.fcm
      })

      sms({
        data: {
          phone: technician.phone,
          message: `The job ${job.name} has been fully approved, and you can now proceed with the job`
        }
      })
    }

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
