const knex = require('knex');
const app = require('../src/app.js');
const helpers = require('./test-helpers');

describe('Task-category Endpoints', () => {
  let db;

  const {
    testUsers,
    testGroups,
    testGroupsMembers,
    testTasks,
    testCategories,
  } = helpers.makeAllFixtures();

  const testUser = testUsers[0];
  const testUser2 = testUsers[1];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/categories', () => {
    beforeEach('insert all', () =>
      helpers.seedAll(
        db,
        testUsers,
        testGroups,
        testGroupsMembers,
        testTasks,
        testCategories,
      ),
    );

    it('responds with 400 missing group_id if not supplied', () => {
      const requestBody = {
        category_name: 'Testing Category',
      };
      return supertest(app)
        .post('/api/categories')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(requestBody)
        .expect(400, {
          error: "Missing 'group_id' in request body",
        });
    });

    it('responds with 400 missing category_name if not supplied', () => {
      const requestBody = {
        group_id: 3,
      };
      return supertest(app)
        .post('/api/categories')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(requestBody)
        .expect(400, {
          error: "Missing 'category_name' in request body",
        });
    });

    it('adds a new category to the database', () => {
      const requestBody = {
        category_name: 'Testing Category',
        group_id: 1,
      };

      return supertest(app)
        .post('/api/categories')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(requestBody)
        .expect(201)
        .expect(res => {
          expect(res.body.category_name).to.eql(requestBody.category_name);
          expect(res.body.group_id).to.eql(requestBody.group_id);
          expect(res.body).to.have.property('id');
        })
        .then(res =>
          supertest(app)
            .get(`/api/categories/${res.body.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(res.body),
        );
    });
  });

  describe('GET /api/categories/group/:group_id', () => {
    context('Given the group has no categories', () => {
      beforeEach('insert groups and members', () =>
        helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
      );
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/categories/group/2')
          .set('Authorization', helpers.makeAuthHeader(testUser2))
          .expect(200, []);
      });
    });

    context('Given the group has categories', () => {
      beforeEach('insert all', () =>
        helpers.seedAll(
          db,
          testUsers,
          testGroups,
          testGroupsMembers,
          testTasks,
          testCategories,
        ),
      );

      it('responds 200 with array of categories in group', () => {
        const expectedCategories = testCategories;

        return supertest(app)
          .get('/api/categories/group/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedCategories);
      });
    });
  });

  describe('GET /api/categories/:category_id', () => {
    context('Given no categories', () => {
      beforeEach('insert groups and members', () =>
        helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
      );
      it('responds with 500', () => {
        return supertest(app)
          .get('/api/categories/5')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404);
      });
    });

    context('Given there are categories in the database', () => {
      beforeEach('insert all', () =>
        helpers.seedAll(
          db,
          testUsers,
          testGroups,
          testGroupsMembers,
          testTasks,
          testCategories,
        ),
      );

      it.skip('responds with 404 if category is not found', () => {
        return supertest(app)
          .get('/api/categories/9')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: `Category doesn't exist` });
      });

      it.skip('responds with 200 and the specified category', () => {
        const categoryId = 2;
        const expectedCategory = testCategories[categoryId - 1];
        return supertest(app)
          .get(`/api/categories/${categoryId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedCategory);
      });
    });
  });

  describe('PATCH /api/categories/:id', () => {
    context('Given there are categories in the database', () => {
      beforeEach('insert all', () =>
        helpers.seedAll(
          db,
          testUsers,
          testGroups,
          testGroupsMembers,
          testTasks,
          testCategories,
        ),
      );

      it('responds 200 with updated cateogry', () => {
        const newName = 'new category name';
        const expectedCategory = {
          ...testCategories[0],
          category_name: newName,
        };
        return supertest(app)
          .patch(`/api/categories/1`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send({ category_name: newName })
          .expect(200)
          .then(res =>
            supertest(app)
              .get('/api/categories/1')
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .then(res => {
                expect(res.body).to.eql(expectedCategory);
              }),
          );
      });
    });
  });

  describe('DELETE /api/categories/:id', () => {
    context('Given no categories', () => {
      beforeEach('insert groups and members', () =>
        helpers.seedGroups(db, testUsers, testGroups, testGroupsMembers),
      );
      it('responds 404 when category does not exist', () => {
        return supertest(app)
          .delete('/api/categories/1')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: "Category doesn't exist" });
      });
    });

    context('Given there are categories in the database', () => {
      beforeEach('insert all', () =>
        helpers.seedAll(
          db,
          testUsers,
          testGroups,
          testGroupsMembers,
          testTasks,
          testCategories,
        ),
      );

      it('responds 204 and removes the category by ID from the database', () => {
        const idToRemove = 2;
        return supertest(app)
          .delete(`/api/categories/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204);
      });
    });
  });
});
