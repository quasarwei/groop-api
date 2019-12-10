const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * creaete a knex instance connected to postgres
 * @returns {knex instance}
 */

function makeKnexInstance() {
  return knex({
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL,
  });
}

function makeUsersArray() {
  return [
    {
      id: 1,
      fullname: 'test name 1',
      username: 'test-user-1',
      email: 'test1@email.com',
      password: 'password',
      notifications: true,
    },
    {
      id: 2,
      fullname: 'test name 2',
      username: 'test-user-2',
      email: 'test2@email.com',
      password: 'password',
      notifications: false,
    },
  ];
}

function makeGroups() {
  return [
    {
      id: 1,
      name: 'group 1',
      owner_id: 1,
    },
    {
      id: 2,
      name: 'group 2',
      owner_id: 2,
    },
  ];
}

function makeGroupsMembers() {
  return [
    {
      id: 1,
      group_id: 1,
      member_id: 1,
      username: 'test-user-1',
      score: 0,
    },
    {
      id: 2,
      group_id: 1,
      member_id: 2,
      username: 'test-user-2',
      score: 0,
    },
    {
      id: 3,
      group_id: 2,
      member_id: 2,
      username: 'test-user-2',
      score: 0,
    },
  ];
}

function makeTasks() {
  return [
    {
      id: 1,
      name: 'task 1',
      description: 'task 1 description',
      completed: false,
      creator_id: 1,
      date_due: new Date('2020-01-01T00:00:00.615Z'),
      group_id: 1,
      user_assigned_id: 1,
      priority: 3,
      time_start: new Date('2019-12-23T00:00:00.615Z'),
      category_id: null,
    },
    {
      id: 2,
      name: 'task 2',
      description: 'task 2 description',
      completed: false,
      creator_id: 1,
      date_due: new Date('2020-01-02T00:00:00.615Z'),
      group_id: 1,
      user_assigned_id: 2,
      priority: 2,
      time_start: new Date('2019-12-22T00:00:00.615Z'),
      category_id: 1,
    },
    {
      id: 3,
      name: 'task 3',
      description: 'task 3 description',
      completed: true,
      creator_id: 1,
      date_due: new Date('2020-01-02T00:00:00.615Z'),
      group_id: 1,
      user_assigned_id: 1,
      priority: 2,
      time_start: new Date('2019-12-22T00:00:00.615Z'),
      category_id: 1,
    },
    {
      id: 4,
      name: 'task 4',
      description: 'task 4 description',
      completed: false,
      creator_id: 2,
      date_due: new Date('2020-01-02T00:00:00.615Z'),
      group_id: 2,
      user_assigned_id: 2,
      priority: 1,
      time_start: new Date('2019-12-22T00:00:00.615Z'),
      category_id: 2,
    },
  ];
}

function makeTaskCategories() {
  return [
    {
      id: 1,
      category_name: 'category 1',
      group_id: 1,
    },
    {
      id: 2,
      category_name: 'category 2',
      group_id: 2,
    },
    {
      id: 3,
      category_name: 'category 3',
      group_id: 2,
    },
  ];
}

function makeAllFixtures() {
  const testUsers = makeUsersArray();
  const testGroups = makeGroups();
  const testGroupsMembers = makeGroupsMembers();
  const testTasks = makeTasks();
  const testCategories = makeTaskCategories();

  return {
    testUsers,
    testGroups,
    testGroupsMembers,
    testTasks,
    testCategories,
  };
}

// make a bearer token with jwt for authorization header
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

// remove data from tables and reset sequences for SERIAL id fields
function cleanTables(db) {
  return db.transaction(trx =>
    // prettier-ignore
    trx.raw(
  `TRUNCATE 
    groop_users,
    groop_groups,
    groop_groups_members,
    groop_task_categories,
    groop_tasks
  `
    ).then(() =>Promise.all([
      trx.raw(`ALTER SEQUENCE groop_task_categories_id_seq minvalue 0 START WITH 1`),
      trx.raw(`ALTER SEQUENCE groop_groups_members_id_seq minvalue 0 START WITH 1`),
      trx.raw(`ALTER SEQUENCE groop_tasks_id_seq minvalue 0 START WITH 1`),
      trx.raw(`ALTER SEQUENCE groop_groups_id_seq minvalue 0 START WITH 1`),
      trx.raw(`ALTER SEQUENCE groop_users_id_seq minvalue 0 START WITH 1`),
      trx.raw(`SELECT setval('groop_task_categories_id_seq', 0)`),
      trx.raw(`SELECT setval('groop_groups_members_id_seq', 0)`),
      trx.raw(`SELECT setval('groop_tasks_id_seq', 0)`),
      trx.raw(`SELECT setval('groop_groups_id_seq', 0)`),
      trx.raw(`SELECT setval('groop_users_id_seq', 0)`),
    ])),
  );
}

// insert users into db with bcrypted passwords
function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db.transaction(async trx => {
    await trx.into('groop_users').insert(preppedUsers);
    await trx.raw(`Select setval('groop_users_id_seq', ?)`, [
      users[users.length - 1].id,
    ]);
  });
}

async function seedGroups(db, users, groups, groupsmembers) {
  await seedUsers(db, users);

  await db.transaction(async trx => {
    await trx.into('groop_groups').insert(groups);
    await trx.into('groop_groups_members').insert(groupsmembers);

    await Promise.all([
      trx.raw(`SELECT setval('groop_groups_id_seq', ?)`, [
        groups[groups.length - 1].id,
      ]),
      trx.raw(`SELECT setval('groop_groups_members_id_seq', ?)`, [
        groupsmembers[groupsmembers.length - 1].id,
      ]),
    ]);
  });
}

async function seedTasks(db, tasks, categories) {
  await db.transaction(async trx => {
    await trx.into('groop_task_categories').insert(categories);
    await trx.into('groop_tasks').insert(tasks);

    await Promise.all([
      trx.raw(`SELECT setval('groop_tasks_id_seq', ?)`, [
        tasks[tasks.length - 1].id,
      ]),
      trx.raw(`SELECT setval('groop_task_categories_id_seq', ?)`, [
        categories[categories.length - 1].id,
      ]),
    ]);
  });
}

async function seedAll(db, users, groups, groupsmembers, tasks, categories) {
  await seedUsers(db, users);
  await db.transaction(async trx => {
    await trx.into('groop_groups').insert(groups);
    await trx.into('groop_groups_members').insert(groupsmembers);
    await trx.into('groop_task_categories').insert(categories);
    await trx.into('groop_tasks').insert(tasks);

    await Promise.all([
      trx.raw(`SELECT setval('groop_groups_id_seq', ?)`, [
        groups[groups.length - 1].id,
      ]),
      trx.raw(`SELECT setval('groop_groups_members_id_seq', ?)`, [
        groupsmembers[groupsmembers.length - 1].id,
      ]),
      trx.raw(`SELECT setval('groop_tasks_id_seq', ?)`, [
        tasks[tasks.length - 1].id,
      ]),
      trx.raw(`SELECT setval('groop_task_categories_id_seq', ?)`, [
        categories[categories.length - 1].id,
      ]),
    ]);
  });
}

module.exports = {
  makeKnexInstance,
  makeUsersArray,
  makeGroups,
  makeGroupsMembers,
  makeTasks,
  makeTaskCategories,
  makeAllFixtures,
  makeAuthHeader,
  cleanTables,
  seedUsers,
  seedGroups,
  seedTasks,
  seedAll,
};
