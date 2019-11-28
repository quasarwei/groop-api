const GroupsMembersService = {
  addGroupMember(knex, group_id, member_id) {
    return knex('groop_groups_members')
      .insert({ group_id, member_id })
      .returning('*')
      .then(rows => rows[0]);
  },
  deleteGroupMember(knex, group_id, member_id) {
    return knex('groop_groups_members')
      .where({ group_id, member_id })
      .delete();
  },
};
module.exports = GroupsMembersService;
