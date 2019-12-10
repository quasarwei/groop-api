const app = require('../src/app');
const helpers = require('./test-helpers');

describe('groups endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testGroups = helpers.makeGroups();
  const testGroupsMembers = helpers.makeGroupsMembers();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/groups', () => {
    beforeEach('insert users, groups, and groupsmembers', () =>
      helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
    );

    it(`responds with 400 required error when 'name' is missing`, () => {
      return supertest(app)
        .post('/api/groups')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({})
        .expect(400, {
          error: `Missing 'name' in request body`,
        });
    });

    it('responds 201 and creates a new group', () => {
      const newGroupName = 'test group 1';

      return supertest(app)
        .post('/api/groups')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send({ name: newGroupName })
        .expect(201)
        .then(res => {
          expect(res.body.id).to.eql(3);
          expect(res.body.name).to.eql(newGroupName);
          expect(res.body.owner_id).to.eql(testUser.id);
          expect(res.headers.location).to.eql(`/api/groups/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/api/groups/3`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(200)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.name).to.eql(newGroupName);
              expect(res.body.owner_id).to.eql(testUser.id);
            }),
        );
    });
  });

  describe('GET /api/groups/:group_id', () => {
    context(
      'given proper authorization, group exists, and user is a member of group',
      () => {
        beforeEach('insert users, groups, and groupsmembers', () =>
          helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
        );
        it('responds 200 with group', () => {
          const expectedGroup = testGroups[0];
          return supertest(app)
            .get('/api/groups/1')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(200)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.name).to.eql(expectedGroup.name);
              expect(res.body.owner_id).to.eql(expectedGroup.owner_id);
            });
        });
      },
    );
  });

  describe('DELETE /api/groups/:group_id', () => {
    context(
      'given proper authorization, group exists, and user is the group owner',
      () => {
        beforeEach('insert users, groups, and groupsmembers', () =>
          helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
        );
        it('responds 204, no content', () => {
          return supertest(app)
            .delete('/api/groups/1')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(204);
        });
      },
    );
  });
});
