const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected Endpoints', function() {
  let db;

  const {
    testUsers,
    testGroups,
    testGroupsMembers,
    testTasks,
    testCategories,
  } = helpers.makeAllFixtures();

  const [testUser] = testUsers;

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach(
    'insert users, groups, groupsmembers, tasks, and categories',
    () => {
      return helpers.seedAll(
        db,
        testUsers,
        testGroups,
        testGroupsMembers,
        testTasks,
        testCategories,
      );
    },
  );

  const protectedEndpoints = [
    {
      name: 'GET /api/groupsmembers',
      path: '/api/groupsmembers',
      method: supertest(app).get,
    },
    // {
    //   name: 'GET /api/language/head',
    //   path: '/api/language/head',
    //   method: supertest(app).get,
    // },
    // {
    //   name: 'POST /api/language/guess',
    //   path: '/api/language/guess',
    //   method: supertest(app).post,
    // },
    // {
    //   name: 'PUT /api/auth/token',
    //   path: '/api/auth/token',
    //   method: supertest(app).put,
    // },
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds 401 'Missing bearer token' when no bearer token`, () => {
        return endpoint
          .method(endpoint.path)
          .expect(401, { error: `Missing bearer token` });
      });

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0];
        const invalidSecret = 'bad-secret';
        return endpoint
          .method(endpoint.path)
          .set(
            'Authorization',
            helpers.makeAuthHeader(validUser, invalidSecret),
          )
          .expect(401, { error: `Unauthorized request` });
      });

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { username: 'user-not-existy', id: 1 };
        return endpoint
          .method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` });
      });
    });
  });
});
