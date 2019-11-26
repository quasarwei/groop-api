const TasksService = {
  postNewTask(knex, newTopicInfo) {
    return knex('groop_tasks')
      .insert(newTaskInfo)
      .returning('*')
      .then(rows => {return rows[0]});
  }
};
