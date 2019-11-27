const GroupsService = {
  postNewGroup(knex, newGroupInfo) {
    return knex('groop_groups')
      .insert(newGroupInfo)
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
};
module.exports = GroupsService;
