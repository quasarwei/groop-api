const TasksService = {
  postNewTask(knex, newTaskInfo) {
    return knex('groop_tasks')
      .insert(newTaskInfo)
      .returning('*')
      .then(rows => {return rows[0];} );
  }
};
module.exports = TasksService;
