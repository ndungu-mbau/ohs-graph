// Import the dependencies for testing
import chai from "chai"
import chaiHttp from "chai-http"
var rimraf = require("rimraf")
import app from "../src/server"

// Configure chai
chai.use(chaiHttp)
chai.should()
var expect = chai.expect

const sharedInfo = {}
let authorization = null

rimraf(".tmp/localDiskDb/*", () => {
  console.log("  Cleared setup dir")
})

describe("Setup", () => {
  before(function (done) {
    this.timeout(4000) // wait for db connections etc.

    setTimeout(done, 4000)
  });

  describe("OPS", function () {
    it("Health check should return 200", done => {
      chai
        .request(app)
        .get("/health")
        .end((err, res) => {
          res.should.have.status(200);

          done();
        });
    });
  });
});

describe("SYSADMIN", function () {
  it("Should log in sysadmin", done => {
    chai
      .request(app)
      .post("/auth/login")
      .set("content-type", "application/json")
      .send({
        phone: "0700111222",
        password: "suPassword"
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null

        sharedInfo.authorization = res.body.token
        done();
      });
  });
  it("Should fetch user from token", done => {
    chai
      .request(app)
      .get("/auth/me")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null

        sharedInfo.userId = res.body.id
        done();
      });  
  })
});

describe("Departments", () => {
  it("Should create an department", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($department: Idepartment!) {
            departments {
              create(department: $department) {
                id
              }
            }
          }            
        `,
        variables: {
          department: {
            name: "department1",
            description: "DepartmentOne",
            hod: sharedInfo.userId,
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.departments.create.id).to.be.a.string;

        sharedInfo.departmentId = res.body.data.departments.create.id;
        done();
      });
  });

  it("Should update an department", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($department: Udepartment!) {
            departments {
              update(department: $department) {
                id
              }
            }
          }            
        `,
        variables: {
          department: {
            id: sharedInfo.departmentId,
            name: "updated department",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.departments.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch department", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          departments{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.departments[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Divisions", () => {
  it("Should create a division", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($division: Idivision!) {
            divisions {
              create(division: $division) {
                id
              }
            }
          }            
        `,
        variables: {
          division: {
            name: "division1",
            department: sharedInfo.departmentId,
            manager: sharedInfo.userId
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.divisions.create.id).to.be.a.string;

        sharedInfo.divisionId = res.body.data.divisions.create.id;
        done();
      });
  });

  it("Should update an division", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($division: Udivision!) {
            divisions {
              update(division: $division) {
                id
              }
            }
          }            
        `,
        variables: {
          division: {
            id: sharedInfo.divisionId,
            name: "updated division",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.divisions.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch division", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          divisions{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.divisions[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Scopes", () => {
  it("Should create a scope", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($scope: Iscope!) {
            scopes {
              create(scope: $scope) {
                id
              }
            }
          }            
        `,
        variables: {
          scope: {
            name: "scope1",
            division: sharedInfo.divisionId,
            activity:"list,of,comma,separated,activities",
            controls:"list,of,comma,separated,controls",
            hazards:"list,of,comma,separated,hazards",
            hazard: "HIGH"
          }
        }
      })
      .end((err, res) => {
        console.log(res.body)
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.scopes.create.id).to.be.a.string;

        sharedInfo.scopeId = res.body.data.scopes.create.id;
        done();
      });
  });

  it("Should update an scope", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($scope: Uscope!) {
            scopes {
              update(scope: $scope) {
                id
              }
            }
          }            
        `,
        variables: {
          scope: {
            id: sharedInfo.scopeId,
            name: "updated scope",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.scopes.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch scope", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          scopes{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.scopes[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Roles", () => {
  it("Should create a role", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($role: Irole!) {
            roles {
              create(role: $role) {
                id
              }
            }
          }            
        `,
        variables: {
          role: {
            name: "role1",
            permissions: ["HOD", "PROJECT_MANAGER"]
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.roles.create.id).to.be.a.string;

        sharedInfo.roleId = res.body.data.roles.create.id;
        done();
      });
  });

  it("Should update an role", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($role: Urole!) {
            roles {
              update(role: $role) {
                id
              }
            }
          }            
        `,
        variables: {
          role: {
            id: sharedInfo.roleId,
            name: "updated role",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.roles.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch role", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          roles{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.roles[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Users", () => {
  it("Should create an user", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($Iuser: Iuser!) {
            users {
              create(user: $Iuser) {
                id
              }
            }
          }            
        `,
        variables: {
          Iuser: {
            name: "user1",
            phone: "0719420491",
            department: sharedInfo.departmentId,
            fcm:"test-fcm-id",
            type: sharedInfo.roleId
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.users.create.id).to.be.a.string;

        sharedInfo.userId = res.body.data.users.create.id;
        done();
      });
  });

  it("Should create a user without dept", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($Iuser: Iuser!) {
            users {
              create(user: $Iuser) {
                id
              }
            }
          }            
        `,
        variables: {
          Iuser: {
            name: "user2",
            phone: "0774751895",
            fcm:"test-fcm-id",
            type: sharedInfo.roleId
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.users.create.id).to.be.a.string;

        sharedInfo.ohsId = res.body.data.users.create.id;
        done();
      });
  });

  it("Should log in normal user", done => {
    chai
      .request(app)
      .post("/auth/login")
      .set("content-type", "application/json")
      .send({
        phone: "0719420491",
        password: "loginpass"
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null
        expect(res.body.ok).to.be.equals(true)

        // sharedInfo.authorization = res.body.token
        done();
      });
  });

  it("Should update an user", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($user: Uuser!) {
            users {
              update(user: $user) {
                id
              }
            }
          }            
        `,
        variables: {
          user: {
            id: sharedInfo.userId,
            name: "updated user",
            password: "password"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.users.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch user", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          users{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.users[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Jobs", () => {
  it("Should create an job", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($Ijob: Ijob!) {
            jobs {
              create(job: $Ijob) {
                id
              }
            }
          }            
        `,
        variables: {
          Ijob: {
            name: "job1",
            scope: sharedInfo.scopeId,
            department: sharedInfo.departmentId,
            technician: sharedInfo.userId,
            location: { lat: 25.3, lng: 0.25 }
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.jobs.create.id).to.be.a.string;

        sharedInfo.jobId = res.body.data.jobs.create.id;
        done();
      });
  });

  it("Should update an job", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($job: Ujob!) {
            jobs {
              update(job: $job) {
                id
              }
            }
          }            
        `,
        variables: {
          job: {
            id: sharedInfo.jobId,
            name: "updated job"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.jobs.update.id).to.be.a.string;
        done();
      });
  });
});

describe("Job Statuses", () => {
  it("Should create an status", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($status: Istatus!) {
            status {
              create(status: $status) {
                id
              }
            }
          }            
        `,
        variables: {
          status: {
            type: "NEW",
            job: sharedInfo.jobId
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.status.create.id).to.be.a.string;

        sharedInfo.statusId = res.body.data.status.create.id;
        done();
      });
  });

  it("Should update an status", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($status: Ustatus!) {
            status {
              update(status: $status) {
                id
              }
            }
          }            
        `,
        variables: {
          status: {
            id: sharedInfo.statusId,
            type: "REJECTED",
            reason: "I don't want it",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.status.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch status", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          statuses{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.statuses[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Controls", () => {
  it("Should create an control", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($Icontrol: Icontrol!) {
            controls {
              create(control: $Icontrol) {
                id
              }
            }
          }            
        `,
        variables: {
          Icontrol: {
            text: "control 1 text"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.controls.create.id).to.be.a.string;

        sharedInfo.controlId = res.body.data.controls.create.id;
        done();
      });
  });

  it("Should update an control", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($control: Ucontrol!) {
            controls {
              update(control: $control) {
                id
              }
            }
          }            
        `,
        variables: {
          control: {
            id: sharedInfo.controlId,
            text: "updated control text"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.controls.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch control", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          controls{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.controls[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Hazards", () => {
  it("Should create an hazard", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($Ihazard: Ihazard!) {
            hazards {
              create(hazard: $Ihazard) {
                id
              }
            }
          }            
        `,
        variables: {
          Ihazard: {
            text: "hazard 1 text",
            consequence: "Consequence here",
            controls: [sharedInfo.controlId].join(",")
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.hazards.create.id).to.be.a.string;

        sharedInfo.hazardId = res.body.data.hazards.create.id;
        done();
      });
  });

  it("Should update an hazard", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($hazard: Uhazard!) {
            hazards {
              update(hazard: $hazard) {
                id
              }
            }
          }            
        `,
        variables: {
          hazard: {
            id: sharedInfo.hazardId,
            text: "updated hazard text"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.hazards.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch hazard", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          hazards{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.hazards[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Documents", () => {
  it("Should create an document", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($document: Idocument!) {
            documents {
              create(document: $document) {
                id
              }
            }
          }            
        `,
        variables: {
          document: {
            name: "document one",
            url: "https://random.document/one",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.documents.create.id).to.be.a.string;

        sharedInfo.documentId = res.body.data.documents.create.id;
        done();
      });
  });

  it("Should update an document", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($document: Udocument!) {
            documents {
              update(document: $document) {
                id
              }
            }
          }            
        `,
        variables: {
          document: {
            id: sharedInfo.documentId,
            name: "updated document"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.documents.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch document", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          documents{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.documents[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Compliances", () => {
  it("Should create an compliance", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($compliance: Icompliance!) {
            compliances {
              create(compliance: $compliance) {
                id
              }
            }
          }            
        `,
        variables: {
          compliance: {
            ppe: "http://via.placeholder.com/360x720/fff",
            induction: "http://via.placeholder.com/360x720/fff",
            toolbox: "http://via.placeholder.com/360x720/fff",
            first_aid: "http://via.placeholder.com/360x720/fff",
            extinguisher: "http://via.placeholder.com/360x720/fff",
            jha: [sharedInfo.hazardId],
            documents: [sharedInfo.documentId],
            erp: "https://firebasestorage.googleapis.com/v0/b/adrian-ohs-system.appspot.com/o/10583-1580702527585.docx?alt=media",
            job: sharedInfo.jobId
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.compliances.create.id).to.be.a.string;

        sharedInfo.complianceId = res.body.data.compliances.create.id;
        done();
      });
  });

  it("Should update an compliance", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($compliance: Ucompliance!) {
            compliances {
              update(compliance: $compliance) {
                id
              }
            }
          }            
        `,
        variables: {
          compliance: {
            id: sharedInfo.complianceId,
            induction: "http://placeholder.com/360x720/008000",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.compliances.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch compliance", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          compliances{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.compliances[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Approvals", () => {
  it("Should create an approval", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($approval: Iapproval!) {
            approvals {
              create(approval: $approval) {
                id
              }
            }
          }            
        `,
        variables: {
          approval: {
            level: "LVL_2",
            status: "ACCEPTED",
            job: sharedInfo.jobId
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.approvals.create.id).to.be.a.string;

        sharedInfo.approvalId = res.body.data.approvals.create.id;
        done();
      });
  });

  it("Should update an approval", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($approval: Uapproval!) {
            approvals {
              update(approval: $approval) {
                id
              }
            }
          }            
        `,
        variables: {
          approval: {
            id: sharedInfo.approvalId,
            status: "REJECTED",
            reason: "Mostly incomplete"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.approvals.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch approval", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          approvals{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.approvals[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Closure Types", () => {
  it("Should create an closuretype", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($closuretype: Iclosuretype!) {
            closuretypes {
              create(closuretype: $closuretype) {
                id
              }
            }
          }            
        `,
        variables: {
          closuretype: {
            name: "Accidents",
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.closuretypes.create.id).to.be.a.string;

        sharedInfo.closuretypeId = res.body.data.closuretypes.create.id;
        done();
      });
  });

  it("Should update an closuretype", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($closuretype: Uclosuretype!) {
            closuretypes {
              update(closuretype: $closuretype) {
                id
              }
            }
          }            
        `,
        variables: {
          closuretype: {
            id: sharedInfo.closuretypeId,
            name: "Accident(s)"
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.closuretypes.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch closuretype", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          closuretypes{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.closuretypes[0].id).to.be.a.string;

        done();
      });
  });
});

describe("Closures", () => {
  it("Should create an closure", done => {
    chai
      .request(app)
      .post("/graph")
      .set("content-type", "application/json")
      .set("authorization", sharedInfo.authorization)
      .send({
        query: `
          mutation ($closure: Iclosure!) {
            closures {
              create(closure: $closure) {
                id
              }
            }
          }            
        `,
        variables: {
          closure: {
            closuretype: [sharedInfo.closuretypeId],
            job: sharedInfo.jobId,
            amount: ["5"],
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.closures.create.id).to.be.a.string;

        sharedInfo.closureId = res.body.data.closures.create[0].id;
        done();
      });
  });

  it("Should update an closure", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", sharedInfo.authorization)
      .set("content-type", "application/json")
      .send({
        query: `
          mutation ($closure: Uclosure!) {
            closures {
              update(closure: $closure) {
                id
              }
            }
          }            
        `,
        variables: {
          closure: {
            id: sharedInfo.closureId,
            amount: 10
          }
        }
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.closures.update.id).to.be.a.string;
        done();
      });
  });

  it("Should fetch closure", done => {
    chai
      .request(app)
      .post("/graph")
      .set("authorization", authorization)
      .set("content-type", "application/json")
      .send({
        query: `
        {
          closures{
            id
          }
        }        
        `
      })
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.not.be.null;
        expect(res.body.errors).to.not.exist;
        expect(res.body.data.closures[0].id).to.be.a.string;

        done();
      });
  });
});