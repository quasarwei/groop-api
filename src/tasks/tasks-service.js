const TasksService = {
  getAllTasks(knex){
    return knex('groop_tasks')
      .select('*');
  },
  postNewTask(knex, newTaskInfo) {
    return knex('groop_tasks')
      .insert(newTaskInfo)
      .returning('*')
      .then(rows => {return rows[0];} );
  },
  getGroupTasks(knex, group_id){
    return knex('groop_tasks')
      .select('*')
      .where('group_id', group_id);
  },
  updateTask(knex, task_id, updateInfo){
    return knex('groop_tasks')
      .where('id', task_id)
      .update(updateInfo)
      .returning('*')
      .then(rows => { return rows[0]; });
  },
  deleteTask(knex, task_id){
    return knex('groop_tasks')
      .where('id', task_id)
      .delete();
  }
};
module.exports = TasksService;
