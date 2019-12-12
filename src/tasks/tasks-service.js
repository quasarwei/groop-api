const TasksService = {
  postNewTask(knex, newTaskInfo) {
    return knex('groop_tasks')
      .insert(newTaskInfo)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getGroupTasks(knex, group_id) {
    return knex
      .select('t.*', 'u.username', 'c.category_name', 'g.name as group_name')
      .from('groop_tasks AS t')
      .leftJoin('groop_users as u', 'u.id', 't.user_assigned_id')
      .leftJoin('groop_task_categories as c', 'c.id', 't.category_id')
      .leftJoin('groop_groups as g', 'g.id', 't.group_id')
      .where('t.group_id', group_id);
  },
  getTaskById(knex, id) {
    return knex('groop_tasks')
      .select('*')
      .where({ id })
      .first();
  },
  getTasksByAssignee(knex, user_assigned_id) {
    return knex
      .select('t.*', 'u.username', 'c.category_name', 'g.name as group_name')
      .from('groop_tasks AS t')
      .leftJoin('groop_users as u', 'u.id', 't.user_assigned_id')
      .leftJoin('groop_task_categories as c', 'c.id', 't.category_id')
      .leftJoin('groop_groups as g', 'g.id', 't.group_id')
      .where({ user_assigned_id });
  },
  updateTask(knex, task_id, updateInfo) {
    return knex('groop_tasks')
      .where('id', task_id)
      .update(updateInfo)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteTask(knex, task_id) {
    return knex('groop_tasks')
      .where('id', task_id)
      .delete();
  },
  checkGroupMembership(knex, group_id, member_id) {
    return knex('groop_groups_members')
      .select('*')
      .where({ group_id, member_id });
  },
  getTasksWithinWeek(knex, user_assigned_id) {
    let today = new Date();
    let newdate = new Date();
    newdate.setDate(today.getDate() + 7);
    return knex('groop_tasks')
      .where({ user_assigned_id })
      .whereBetween('date_due', [today, newdate])
      .orderBy('date_due', 'ascending');
  },
};

module.exports = TasksService;
