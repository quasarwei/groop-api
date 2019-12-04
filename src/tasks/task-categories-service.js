const TaskCategoriesService = {

  postNewCategory(knex, newCategoryInfo) {
    return knex('groop_task_categories')
      .insert(newCategoryInfo)
      .returning('*')
      .then(rows => {
        return rows[0]; });
  },
  getCategoriesForGroup(knex, group_id) {
    return knex('groop_task_categories')
      .select('*')
      .where('group_id', group_id);
  },
  getCategoryInfo(knex, category_id) {
    return knex('groop_task_categories')
      .select('*')
      .where('id', category_id)
      .then(rows => {
        return rows[0]; });
  },
  updateCategory(knex, category_id, updateInfo) {
    return knex('groop_task_categories')
      .where('id', category_id)
      .update(updateInfo)
      .returning('*')
      .then(rows => {
        return rows[0]; });
  },
  deleteCategory(knex, category_id) {
    return knex('groop_task_categories')
      .where('id', category_id)
      .delete();
  }
};

module.exports = TaskCategoriesService;
