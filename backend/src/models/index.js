import Role from './Role.js';
import User from './User.js';
import Category from './Category.js';
import Project from './Project.js';
import Like from './Like.js';
import Comment from './Comment.js';
import ViolationLog from './ViolationLog.js';

Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

User.hasMany(Project, { foreignKey: 'user_id' });
Project.belongsTo(User, { foreignKey: 'user_id' });

Category.hasMany(Project, { foreignKey: 'kategori_id' });
Project.belongsTo(Category, { foreignKey: 'kategori_id' });

User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });
Project.hasMany(Like, { foreignKey: 'project_id' });
Like.belongsTo(Project, { foreignKey: 'project_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });
Project.hasMany(Comment, { foreignKey: 'project_id' });
Comment.belongsTo(Project, { foreignKey: 'project_id' });

User.hasMany(ViolationLog, { foreignKey: 'user_id' });
ViolationLog.belongsTo(User, { foreignKey: 'user_id' });

export { Role, User, Category, Project, Like, Comment, ViolationLog };