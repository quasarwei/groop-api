const app = require('../src/app');
const helpers = require('./test-helpers');

describe('users endpoints', function() {
  let db;
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });
  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/user', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['fullname', 'username', 'password', 'email'];

    requiredFields.forEach(field => {
      const registerAttemptBody = {
        fullname: 'test name',
        username: 'test username',
        password: 'test password',
        email: 'testemail@email.com'
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field];
        return supertest(app)
          .post('/api/user')
          .send(registerAttemptBody)
          .expect(400, { error: `Missing '${field}' in request body`, });
      });
    });

    it('responds with 400 error if password too short', () => {
      const userShortPassword = {
        fullname: 'test name',
        username: 'test username',
        password: '1234567',
        email: 'testemail@email.com'
      };
      return supertest(app)
        .post('/api/user')
        .send(userShortPassword)
        .expect(400, { error: 'Password must be longer than 8 characters' });
    });

    it('responds with 400 error if password too long', () => {
      const userLongPassword = {
        fullname: 'test name',
        username: 'test username',
        password: '*'.repeat(73),
        email: 'testemail@email.com'
      };
      return supertest(app)
        .post('/api/user')
        .send(userLongPassword)
        .expect(400, { error: 'Password must be less than 72 characters' });
    });

    it('responds 400 error when password starts with spaces', () => {
      const userPasswordStartsSpaces = {
        fullname: 'test name',
        username: 'test username',
        password:  ' 1Aa!2Bb@',
        email: 'testemail@email.com'
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordStartsSpaces)
        .expect(400, { error: 'Password must not start or end with empty spaces' });
    });

    it('responds with 400 error when password ends with spaces', () => {
      const userPasswordEndsSpaces = {
        fullname: 'test name',
        username: 'test username',
        password:  '1Aa!2Bb@ ',
        email: 'testemail@email.com'
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordEndsSpaces)
        .expect(400, { error: 'Password must not start or end with empty spaces' });
    });

    it('responds with 400 error when password is not complex enough', () => {
      const userPasswordNotComplex = {
        fullname: 'test name',
        username: 'test username',
        password:  '11AAaabb',
        email: 'testemail@email.com'
      };
      return supertest(app)
        .post('/api/user')
        .send(userPasswordNotComplex)
        .expect(400, { error: 'Password must contain one upper case, lower case, number and special character' });
    });

  });


});
