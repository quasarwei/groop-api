const GroupsService = {
  postNewGroup(knex, newGroupInfo) {
    return knex('groop_groups')
      .insert(newGroupInfo)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteGroup(knex, id) {
    return knex('groop_groups')
      .where({ id })
      .delete();
  },
};
module.exports = GroupsService;
