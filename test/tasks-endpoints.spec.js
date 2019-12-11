const app = require('../src/app');
const helpers = require('./test-helpers');

describe('tasks endpoints', function() {
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

  describe('GET /api/tasks', () => {
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

    let expectedTasks = [testTasks[0], testTasks[2]];

    it('responds 200 with array of tasks user is assigned to', () => {
      return supertest(app)
        .get('/api/tasks')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body[1].id).to.eql(expectedTasks[1].id);
          expect(res.body[1].name).to.eql(expectedTasks[1].name);
          expect(res.body[1].description).to.eql(expectedTasks[1].description);
          expect(res.body[1].completed).to.eql(expectedTasks[1].completed);
          expect(res.body[1].creator_id).to.eql(expectedTasks[1].creator_id);
          expect(res.body[1].group_id).to.eql(expectedTasks[1].group_id);
          expect(res.body[1].user_assigned_id).to.eql(
            expectedTasks[1].user_assigned_id,
          );
          expect(res.body[1].priority).to.eql(expectedTasks[1].priority);
          expect(res.body[1].category_id).to.eql(expectedTasks[1].category_id);
          const expectedDD = new Date(
            expectedTasks[1].date_due,
          ).toLocaleString();
          const actualDD = new Date(res.body[1].date_due).toLocaleString();
          expect(actualDD).to.eql(expectedDD);
          const expectedTS = new Date(
            expectedTasks[1].time_start,
          ).toLocaleString();
          const actualTS = new Date(res.body[1].time_start).toLocaleString();
          expect(actualTS).to.eql(expectedTS);
        });
    });
  });

  describe('GET /api/tasks/:group_id', () => {
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

    let expectedTasks = [testTasks[0], testTasks[1], testTasks[2]];
    it('responds 200 with array of tasks in group with group_id if user is a member of the group', () => {
      return supertest(app)
        .get('/api/tasks/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body[2].id).to.eql(expectedTasks[2].id);
          expect(res.body[2].name).to.eql(expectedTasks[2].name);
          expect(res.body[2].description).to.eql(expectedTasks[2].description);
          expect(res.body[2].completed).to.eql(expectedTasks[2].completed);
          expect(res.body[2].creator_id).to.eql(expectedTasks[2].creator_id);
          expect(res.body[2].group_id).to.eql(expectedTasks[2].group_id);
          expect(res.body[2].user_assigned_id).to.eql(
            expectedTasks[2].user_assigned_id,
          );
          expect(res.body[2].priority).to.eql(expectedTasks[2].priority);
          expect(res.body[2].category_id).to.eql(expectedTasks[2].category_id);
          const expectedDD = new Date(
            expectedTasks[2].date_due,
          ).toLocaleString();
          const actualDD = new Date(res.body[2].date_due).toLocaleString();
          expect(actualDD).to.eql(expectedDD);
          const expectedTS = new Date(
            expectedTasks[2].time_start,
          ).toLocaleString();
          const actualTS = new Date(res.body[2].time_start).toLocaleString();
          expect(actualTS).to.eql(expectedTS);
        });
    });
  });

  describe('POST /api/tasks', () => {
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
    it('responds 201 and creates a new task', () => {
      const newTask = {
        name: 'new task name',
        description: 'new task description',
        group_id: 1,
        category_id: 1,
        priority: 3,
        time_start: '2020-01-02T00:00:00',
        date_due: '2020-01-02T00:00:00',
      };

      return supertest(app)
        .post('/api/tasks')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newTask)
        .expect(201)
        .then(res => {
          expect(res.body.id).to.eql(5);
          expect(res.body.name).to.eql(newTask.name);
          expect(res.body.description).to.eql(newTask.description);
          expect(res.body.completed).to.eql(false);
          expect(res.body.creator_id).to.eql(testUser.id);
          expect(res.body.group_id).to.eql(newTask.group_id);
          expect(res.body.user_assigned_id).to.eql(null);
          expect(res.body.priority).to.eql(newTask.priority);
          expect(res.body.category_id).to.eql(newTask.category_id);

          const expectedDD = new Date(newTask.date_due).toLocaleString();
          const actualDD = new Date(res.body.date_due).toLocaleString();
          expect(actualDD).to.eql(expectedDD);
          const expectedTS = new Date(newTask.time_start).toLocaleString();
          const actualTS = new Date(res.body.time_start).toLocaleString();
          expect(actualTS).to.eql(expectedTS);

          expect(res.headers.location).to.eql(`/api/tasks/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get('/api/tasks/task/5')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(200)
            .expect(res => {
              expect(res.body.id).to.eql(5);
              expect(res.body.name).to.eql(newTask.name);
              expect(res.body.description).to.eql(newTask.description);
              expect(res.body.completed).to.eql(false);
              expect(res.body.creator_id).to.eql(testUser.id);
              expect(res.body.group_id).to.eql(newTask.group_id);
              expect(res.body.user_assigned_id).to.eql(null);
              expect(res.body.priority).to.eql(newTask.priority);
              expect(res.body.category_id).to.eql(newTask.category_id);
              const expectedDD = new Date(newTask.date_due).toLocaleString();
              const actualDD = new Date(res.body.date_due).toLocaleString();
              expect(actualDD).to.eql(expectedDD);
              const expectedTS = new Date(newTask.time_start).toLocaleString();
              const actualTS = new Date(res.body.time_start).toLocaleString();
              expect(actualTS).to.eql(expectedTS);
            }),
        );
    });
  });
  describe('GET /api/tasks/task/:task_id', () => {
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
    it("responds 200 with the task if user is a member of tasks's group", () => {
      const expectedTask = testTasks[2];
      return supertest(app)
        .get('/api/tasks/task/3')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(res => {
          expect(res.body.id).to.eql(expectedTask.id);
          expect(res.body.name).to.eql(expectedTask.name);
          expect(res.body.description).to.eql(expectedTask.description);
          expect(res.body.completed).to.eql(expectedTask.completed);
          expect(res.body.creator_id).to.eql(expectedTask.creator_id);
          expect(res.body.group_id).to.eql(expectedTask.group_id);
          expect(res.body.user_assigned_id).to.eql(
            expectedTask.user_assigned_id,
          );
          expect(res.body.priority).to.eql(expectedTask.priority);
          expect(res.body.category_id).to.eql(expectedTask.category_id);
          const expectedDD = new Date(expectedTask.date_due).toLocaleString();
          const actualDD = new Date(res.body.date_due).toLocaleString();
          expect(actualDD).to.eql(expectedDD);
          const expectedTS = new Date(expectedTask.time_start).toLocaleString();
          const actualTS = new Date(res.body.time_start).toLocaleString();
          expect(actualTS).to.eql(expectedTS);
        });
    });
  });

  describe('PATCH /api/tasks/task/:task_id', () => {
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
    it('responds 200 and returns updated task', () => {
      const updatedTask = { completed: true, name: 'new task title' };
      const expectedTask = {
        ...testTasks[0],
        ...updatedTask,
      };

      return supertest(app)
        .patch('/api/tasks/task/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedTask)
        .expect(200)
        .then(res =>
          supertest(app)
            .get('/api/tasks/task/1')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .then(res => {
              expect(res.body.name).to.eql(expectedTask.name);
              expect(res.body.completed).to.eql(expectedTask.completed);
              expect(res.body.description).to.eql(expectedTask.description);
            }),
        )
        .then(res =>
          supertest(app)
            .get('/api/groupsmembers/1')
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(200)
            .expect(res => {
              expect(res.body[0].score).to.eql(3);
            }),
        );
    });
  });

  describe('DELETE /api/tasks/task/:task_id', () => {
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
    it('responds 204, no content', () => {
      return supertest(app)
        .delete('/api/tasks/task/3')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(204);
    });
  });
});
