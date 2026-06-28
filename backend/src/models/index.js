import Role from './role.js';
import User from './User.js';
import Category from './category.js';
import Project from './Project.js';
import Like from './Like.js';
import Comment from './Comment.js';
import ViolationLog from './ViolationLog.js';

// RELASI USER DAN ROLE
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// RELASI PROJECT DENGAN USER
User.hasMany(Project, { foreignKey: 'user_id' });
Project.belongsTo(User, { foreignKey: 'user_id' });

// KARENA KATEGORI SEKARANG BERUPA TEKS (VARCHAR), KITA PUTUS RELASINYA
Category.hasMany(Project, { foreignKey: 'kategori_id' });
Project.belongsTo(Category, { foreignKey: 'kategori_id' });

// RELASI LIKES (User <-> Project)
User.hasMany(Like, { foreignKey: 'user_id' });
Like.belongsTo(User, { foreignKey: 'user_id' });
Project.hasMany(Like, { foreignKey: 'project_id' });
Like.belongsTo(Project, { foreignKey: 'project_id' });

// RELASI COMMENTS
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });
Project.hasMany(Comment, { foreignKey: 'project_id' });
Comment.belongsTo(Project, { foreignKey: 'project_id' });

// RELASI VIOLATION LOGS (Mencatat Pelaku)
User.hasMany(ViolationLog, { foreignKey: 'user_id' });
ViolationLog.belongsTo(User, { foreignKey: 'user_id' });

export { Role, User, Category, Project, Like, Comment, ViolationLog };