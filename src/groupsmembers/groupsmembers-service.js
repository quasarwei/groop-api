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
  getGroupMembers(knex, group_id) {
    return knex
      .select(
        'gm.member_id',
        'gm.score',
        'u.id',
        'u.username',
        'u.fullname',
        'u.email',
        'u.notifications',
        'gm.group_id',
        'g.name',
      )
      .from('groop_groups_members AS gm')
      .leftJoin('groop_users as u', 'u.id', 'gm.member_id')
      .leftJoin('groop_groups as g', 'g.id', 'gm.group_id')
      .where({ group_id });
  },
  getUserGroups(knex, member_id) {
    return knex('groop_groups_members')
      .select('gm.group_id', 'g.name')
      .from('groop_groups_members AS gm')
      .leftJoin('groop_groups AS g', 'g.id', 'gm.group_id')
      .where({ member_id });
  },
  calculateScore(knex, group_id, user_assigned_id) {
    return knex
      .sum({ score: 'priority' })
      .from('groop_tasks')
      .where({ group_id, user_assigned_id, completed: true });
  },
  updateScore(knex, group_id, member_id, score) {
    return knex('groop_groups_members')
      .where({ group_id, member_id })
      .update(score)
      .returning('*')
      .then(rows => rows[0]);
  },
};
module.exports = GroupsMembersService;
