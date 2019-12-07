const knex = require('knex');
const chai = require('chai');
const expect = chai.expect;
const TaskCategoriesService = require('../src/tasks/task-categories-service.js');

describe('task-categories-service object', function () {
  let db;
  let testData = [
    {
      category_name: 'Test-category1',
      group_id: 1
    },
    {
      category_name: 'Test-category2',
      group_id: 1
    },
    {
      category_name: 'Test-category3',
      group_id: 2
    }
  ];

  before(() => {
    db = knex({ client: 'pg', connection: process.env.TEST_DATABASE_URL, });
  });
  before(() => {
    return db.into('groop_task_categories')
      .insert(testData);
  });
  afterEach(() => db('groop_task_categories').truncate());
  after(() => db.destroy());
  before(() => db('groop_task_categories').truncate());

  describe('getCategoriesForGroup()', () => {

    context('Given groop_task_categories has data', () => {
      beforeEach(() => {
        return db.into('groop_task_categories')
          .insert(testData);
      });
      it('retrieves all categories for a group from groop_task_categories table', () => {
        const group_id = 1;
        return TaskCategoriesService.getCategoriesForGroup(db, group_id)
          .then(actual => {
            expect(actual).to.eql([
              {
                id: 1,
                category_name: 'Test-category1',
                group_id: 1
              },
              {
                id: 2,
                category_name: 'Test-category2',
                group_id: 1
              }
            ]);
          });
      });
      it('getCategoryById retrieves a category by id from groop_task_categories table', () => {
        const thirdId = 3;
        const thirdTestCategory = testData[thirdId - 1];
        return TaskCategoriesService.getCategoryById(db, thirdId)
          .then(actual => {
            expect(actual).to.eql(thirdTestCategory);
          });
      });
      it('deleteCategory removes a category by id from groop_task_categories table', () => {
        const category_id = 2;
        const group_id = 1;
        return TaskCategoriesService.deleteCategory(db, category_id)
          .then(() => TaskCategoriesService.getCategoriesForGroup(db, group_id))
          .then(categoriesForGroup => {
            const expected = {
              id: 1,
              category_name: 'Test-category1',
              group_id: 1
            };
            expect(categoriesForGroup).to.eql(expected);
          });
      });
      it('updateCategory updates a category from groop_task_categories table', () => {
        const category_id = 3;
        const newData = { category_name: 'Different-name' };
        return TaskCategoriesService.updateCategory(db, category_id, newData)
          .then(() => TaskCategoriesService.getCategoryById(db, category_id))
          .then(category => {
            const expected = {
              id: 3,
              category_name: 'Different-name',
              group_id: 2
            };
            expect(category).to.eql(expected);
          });
      });
    });

    context('If groop_task_categories has no data', () => {
      it('getCategoriesForGroup() resolves an empty array', () => {
        const group_id = 1;
        return TaskCategoriesService.getCategoriesForGroup(db, group_id)
          .then(actual => { expect(actual).to.eql([]); });
      });
      it('postNewCategory adds a new category and resolves the new category with an id', () => {
        const newCategory = {
          category_name: 'New-test-category',
          group_id: 4
        };
        return TaskCategoriesService.postNewCategory(db, newCategory)
          .then(actual => {
            expect(actual).to.eql({
              id: 1,
              category_name: 'New-test-category',
              group_id: 4
            });
          });
      });
    });
  });
});
