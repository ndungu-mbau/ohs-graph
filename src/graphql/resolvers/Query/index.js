import {
  list as users,
  single as user,
  nested as Nuser
} from "./users"

import {
  list as roles,
  single as role,
  roleByPermission,
  nested as Nrole
} from "./roles"

import {
  list as departments,
  single as department,
  nested as Ndepartment
} from "./departments"

import {
  list as divisions,
  single as division,
  nested as Ndivision
} from "./divisions"

import {
  list as scopes,
  single as scope,
  nested as Nscope
} from "./scopes"

import {
  list as jobs,
  single as job,
  technicianJobs,
  nested as Njob
} from "./jobs"

import {
  list as controls,
  single as control
} from "./controls"

import {
  list as hazards,
  single as hazard,
  nested as Nhazard
} from "./hazards"

import {
  list as compliances,
  single as compliance,
  nested as Ncompliance
} from "./compliance"

import {
  list as statuses,
  single as status,
  nested as Nstatus
} from "./status"

import {
  list as approvals,
  single as approval,
  nested as Napproval
} from "./approvals"

import {
  list as closuretypes,
  single as closuretype
} from "./closure-types"

import {
  list as closures,
  single as closure,
  nested as Nclosure
} from "./closures"

import {
  list as documents,
  single as document,
} from "./documents"


const nested = {};

Object.assign(
  nested,
  Nuser,
  Nrole,
  Ndepartment,
  Ndivision,
  Nscope,
  Njob,
  Nhazard,
  Ncompliance,
  Nstatus,
  Napproval,
  Nclosure
);

const Query = {
  users,
  user,

  roles,
  role,
  roleByPermission,

  departments,
  department,

  divisions,
  division,

  scopes,
  scope,

  jobs,
  job,
  technicianJobs,

  controls,
  control,

  hazards,
  hazard,

  compliances,
  compliance,

  statuses,
  status,

  approvals,
  approval,

  closuretypes,
  closuretype,

  closures,
  closure,

  documents,
  document,

  hello:() => "Hello query"
}

export {
  Query,
  nested
}