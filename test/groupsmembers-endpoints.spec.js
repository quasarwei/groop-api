const app = require('../src/app');
const helpers = require('./test-helpers');

describe('groupsmembers endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testGroups = helpers.makeGroups();
  const testGroupsMembers = helpers.makeGroupsMembers();
  const testUser = testUsers[0];
  const testUser2 = testUsers[1];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/groupsmembers', () => {
    beforeEach('insert users, groups, and groupsmembers', () =>
      helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
    );

    it('responds 201 and adds a member to a group', () => {
      const newMember = {
        group_id: 2,
        username: 'test-user-1',
      };

      return supertest(app)
        .post('/api/groupsmembers')
        .set('Authorization', helpers.makeAuthHeader(testUser2))
        .send(newMember)
        .expect(201)
        .then(res => {
          expect(res.body.id).to.eql(4);
          expect(res.body.group_id).to.eql(newMember.group_id);
          expect(res.body.username).to.eql(newMember.username);
          expect(res.body.member_id).to.eql(1);
          expect(res.body.score).to.eql(0);
          expect(res.headers.location).to.eql(
            `/api/groupsmembers/${res.body.id}`,
          );
        })
        .then(res =>
          supertest(app)
            .get(`/api/groupsmembers/2`)
            .set('Authorization', helpers.makeAuthHeader(testUser2))
            .expect(200)
            .expect(res => {
              expect(res.body[0]).to.have.property('id');
              expect(res.body[0].group_id).to.eql(newMember.group_id);
              expect(res.body[0].member_id).to.eql(1);
              expect(res.body[0].username).to.eql(newMember.username);
              expect(res.body[0].score).to.eql(0);
            }),
        );
    });
  });

  describe('GET /api/groupsmembers', () => {
    beforeEach('insert users, groups, and groupsmembers', () =>
      helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
    );

    it(`responds 200 with signed-in user's groups`, () => {
      let expectedGroups = [
        { group_id: 1, name: 'group 1' },
        { group_id: 2, name: 'group 2' },
      ];
      return supertest(app)
        .get('/api/groupsmembers')
        .set('Authorization', helpers.makeAuthHeader(testUser2))
        .expect(200)
        .expect(res => {
          expect(res.body[1].group_id).to.eql(expectedGroups[1].group_id);
          expect(res.body[1].name).to.eql(expectedGroups[1].name);
        });
    });
  });

  describe('GET /api/groupsmembers/:group_id', () => {
    beforeEach('insert users, groups, and groupsmembers', () =>
      helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
    );
    let expectedGM = [
      {
        member_id: 1,
        score: 0,
        id: 1,
        username: 'test-user-1',
        fullname: 'test name 1',
        email: 'test1@email.com',
        notifications: true,
        group_id: 1,
        name: 'group 1',
      },
      {
        member_id: 2,
        score: 0,
        id: 2,
        username: 'test-user-2',
        fullname: 'test name 2',
        email: 'test2@email.com',
        notifications: false,
        group_id: 1,
        name: 'group 1',
      },
    ];

    it(`responds 200 with array of groupsmembers`, () => {
      return supertest(app)
        .get(`/api/groupsmembers/1`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body[1].member_id).to.eql(expectedGM[1].member_id);
          expect(res.body[1].score).to.eql(expectedGM[1].score);
          expect(res.body[1].id).to.eql(expectedGM[1].id);
          expect(res.body[1].username).to.eql(expectedGM[1].username);
          expect(res.body[1].fullname).to.eql(expectedGM[1].fullname);
          expect(res.body[1].email).to.eql(expectedGM[1].email);
          expect(res.body[1].notifications).to.eql(expectedGM[1].notifications);
          expect(res.body[1].group_id).to.eql(expectedGM[1].group_id);
          expect(res.body[1].name).to.eql(expectedGM[1].name);
        });
    });
  });
  describe('DELETE /api/groupsmembers/:group_id/member_id', () => {
    beforeEach('insert users, groups, and groupsmembers', () =>
      helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
    );
    it('responds 204, no content', () => {
      return supertest(app)
        .delete('/api/groupsmembers/1/2')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(204);
    });
  });
});
