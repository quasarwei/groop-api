const app = require('../src/app');
const helpers = require('./test-helpers');
const bcrypt = require('bcryptjs');

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

  describe('POST /api/users', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    const requiredFields = ['fullname', 'username', 'password', 'email'];

    requiredFields.forEach(field => {
      const registerAttemptBody = {
        fullname: 'test name',
        username: 'test username',
        password: 'test password',
        email: 'testemail@email.com',
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete registerAttemptBody[field];
        return supertest(app)
          .post('/api/users')
          .send(registerAttemptBody)
          .expect(400, { error: `Missing '${field}' in request body` });
      });
    });

    it('responds with 400 error if password too short', () => {
      const userShortPassword = {
        fullname: 'test name',
        username: 'test username',
        password: '1234567',
        email: 'testemail@email.com',
      };
      return supertest(app)
        .post('/api/users')
        .send(userShortPassword)
        .expect(400, { error: 'Password must be longer than 8 characters' });
    });

    it('responds with 400 error if password too long', () => {
      const userLongPassword = {
        fullname: 'test name',
        username: 'test username',
        password: '*'.repeat(73),
        email: 'testemail@email.com',
      };
      return supertest(app)
        .post('/api/users')
        .send(userLongPassword)
        .expect(400, { error: 'Password must be less than 72 characters' });
    });

    it('responds 400 error when password starts with spaces', () => {
      const userPasswordStartsSpaces = {
        fullname: 'test name',
        username: 'test username',
        password: ' 1Aa!2Bb@',
        email: 'testemail@email.com',
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordStartsSpaces)
        .expect(400, {
          error: 'Password must not start or end with empty spaces',
        });
    });

    it('responds with 400 error when password ends with spaces', () => {
      const userPasswordEndsSpaces = {
        fullname: 'test name',
        username: 'test username',
        password: '1Aa!2Bb@ ',
        email: 'testemail@email.com',
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordEndsSpaces)
        .expect(400, {
          error: 'Password must not start or end with empty spaces',
        });
    });

    it('responds with 400 error when password is not complex enough', () => {
      const userPasswordNotComplex = {
        fullname: 'test name',
        username: 'test username',
        password: '11AAaabb',
        email: 'testemail@email.com',
      };
      return supertest(app)
        .post('/api/users')
        .send(userPasswordNotComplex)
        .expect(400, {
          error:
            'Password must contain one upper case, lower case, number and special character',
        });
    });

    it('responds 400 "User name already taken" if username is not unique', () => {
      const duplicateUserName = {
        fullname: 'test name',
        username: testUser.username,
        password: '11AAaa!!',
        email: 'testemail@email.com',
      };
      return supertest(app)
        .post('/api/users')
        .send(duplicateUserName)
        .expect(400, { error: 'Username already taken' });
    });

    it('responds 400 error if email address is not unique', () => {
      const duplicateEmailAddress = {
        fullname: 'test name',
        username: 'test username',
        password: '11AAaa!!',
        email: testUser.email,
      };
      return supertest(app)
        .post('/api/users')
        .send(duplicateEmailAddress)
        .expect(400, { error: 'Email is already being used' });
    });

    describe('Given a valid user', () => {
      it('responds 201 with serialized user with no password', () => {
        const newUser = {
          fullname: 'test name',
          username: 'test username',
          password: '11AAaa!!',
          email: 'testemail@email.com',
        };
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.fullname).to.eql(newUser.fullname);
            expect(res.body.username).to.eql(newUser.username);
            expect(res.body.email).to.eql(newUser.email);
            expect(res.body).to.have.property('notifications');
            expect(res.body).to.not.have.property('password');
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          });
      });

      it('stores the new user in db with bcryped password', () => {
        const newUser = {
          fullname: 'test name',
          username: 'test username',
          password: '11AAaa!!',
          email: 'testemail@email.com',
        };
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(res =>
            db
              .from('groop_users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(newUser.username);
                expect(row.name).to.eql(newUser.name);

                return bcrypt.compare(newUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              }),
          );
      });
    });
  });

  describe('PATCH /api/users', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it('responds 200 with serialized user with no password', () => {
      const updatedUser = {
        fullname: 'revised name',
        email: testUser.email,
        password: 'newPassword1!',
        notifications: '',
      };
      return supertest(app)
        .patch('/api/users')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(updatedUser)
        .expect(200)
        .then(res => {
          expect(res.body.id).to.eql(1);
          expect(res.body.fullname).to.eql(updatedUser.fullname);
          expect(res.body.notifications).to.eql(false);
          expect(res.body).to.not.have.property('password');
        });
    });
  });

  describe('GET /api/users', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it('responds 200 with serialized user with no password', () => {
      return supertest(app)
        .get('/api/users')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .then(res => {
          expect(res.body.id).to.eql(1);
          expect(res.body.fullname).to.eql(testUser.fullname);
          expect(res.body.username).to.eql(testUser.username);
          expect(res.body.email).to.eql(testUser.email);
          expect(res.body).to.have.property('notifications');
          expect(res.body).to.not.have.property('password');
        });
    });
  });

  describe('POST /api/users/verify', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    it('responds 204', () => {
      return supertest(app)
        .post('/api/users/verify')
        .send({ password: testUser.password })
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(204);
    });
  });
});
