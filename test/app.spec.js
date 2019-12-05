const { expect } = require('chai');
const mocha = require('mocha');
const supertest = require('supertest');
const app = require('../src/app');

describe('App', () => {
  it('GET / responds with 200 containing "Hello, groups!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, groups!');
  });
})