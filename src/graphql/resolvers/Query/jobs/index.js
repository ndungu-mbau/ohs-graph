const { name } = require("./about.js")

const list = async (root, args, { db: { collections }, user: { id: loggedInId } }) => {
  const entries = await collections[name].find({
    where: {
      isDeleted: false
    }
  });

  const scopes = await collections["scope"].find({
    where: {
      isDeleted: false
    }
  })

  const departments = await collections["department"].find({
    where: {
      isDeleted: false
    }
  })

  const divisions = await collections["division"].find({
    where: {
      isDeleted: false
    }
  })

  const filteredEntries = entries.filter(job => {
    const scope = scopes.find(({ id }) => id === job.scope)
    const department = departments.find(({ id }) => id === scope.department)
    const division = divisions.find(({ id }) => id === department.division)
    const ids = [job.author, department.manager, division.hod, job.ohs]
    return ids.includes(loggedInId)
  })

  return filteredEntries;
};

const listDeleted = async (root, args, { db: { collections } }) => {
  const entries = await collections[name].find({
    where: {
      isDeleted: true
    }
  });
  return entries;
};

const technician = async (root, { filter = "ALL" }, { db: { collections }, user: { id: technician }}) => {
  const entries = await collections[name].find({
    where: {
      technician,
      isDeleted: false
    }
  })

  if(filter === "ALL") return entries

  const statusEntries = await Promise.all(entries.map(async ({ id: job }) => await collections["status"].findOne({ where: { job }})))
  const filteredJobEntryIds = statusEntries.filter(({ type }) => type === filter).map(({ job }) => job)

  const filteredJobEntries = entries.filter(({ id }) => filteredJobEntryIds.includes(id))

  return filteredJobEntries.reverse()
}

const single = async (root, args, { db: { collections } }) => {
  const { id } = args[name];

  const entry = await collections[name].findOne({
    where: { id, isDeleted: false }
  });
  return entry;
};

const nested = {
  [name]: {
    author: async (root, args, { db: { collections }}) => {
      const entry = await collections["user"].findOne({ where : { id: root.author }})
      return entry
    },
    location: (root, args) => {
      return JSON.parse(root.location)
    },
    scope: async (root, args, { db: { collections }}) => {
      const entry = await collections["scope"].findOne({ where : { id: root.scope }})
      return entry
    },
    technician: async (root, args, { db: { collections }}) => {
      const entry = await collections["user"].findOne({ where : { id: root.technician }})
      return entry
    },
    ohs: async (root, args, { db: { collections }}) => {
      const entry = await collections["user"].findOne({ where : { id: root.ohs }})
      return entry
    },
    compliance: async (root, args, { db: { collections }}) => {
      const entry = await collections["compliance"].findOne({ where : { job: root.id }})
      return entry
    },
    status: async (root, args, { db: { collections }}) => {
      const entry = await collections["status"].findOne({ where : { job: root.id }})
      return entry
    },
    lv1_approval: async (root, args, { db: { collections }}) => {
      const entry = await collections["approval"].findOne({ where : { job: root.id, level: "LVL_1" }})
      return entry
    },
    lv2_approval: async (root, args, { db: { collections }}) => {
      const entry = await collections["approval"].findOne({ where : { job: root.id, level: "LVL_2" }})
      return entry
    },
    lv3_approval: async (root, args, { db: { collections }}) => {
      const entry = await collections["approval"].findOne({ where : { job: root.id, level: "LVL_3" }})
      return entry
    },
    lv4_approval: async (root, args, { db: { collections }}) => {
      const entry = await collections["approval"].findOne({ where : { job: root.id, level: "LVL_4" }})
      return entry
    },
    closure: async (root, args, { db: { collections }}) => {
      const entries = await collections["closure"].find({ where : { job: root.id }})
      return entries
    },
  }
}

export { list, single, listDeleted, technician as technicianJobs, nested };
