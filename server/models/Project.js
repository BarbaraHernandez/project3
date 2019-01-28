module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  });

  Project.associate = (models) => {
    // Associate project back to status
    models.Project.belongsTo(models.Status, {
      foreignKey: 'statusID',
    });

    // Associate project back to user
    models.Project.belongsTo(models.User, {
      foreignKey: 'ownerID',
    });

    // Project can have many members
    models.Idea.hasMany(models.ProjectMember, {
      foreignKey: {
        name: 'projectID',
        allowNull: false,
      },
      onDelete: 'cascade',
    });

    // Project can have many comments
    models.Idea.hasMany(models.ProjectComment, {
      foreignKey: {
        name: 'projectID',
        allowNull: false,
      },
      onDelete: 'cascade',
    });

    // Project can have many milestones
    models.Idea.hasMany(models.ProjectMilestone, {
      foreignKey: {
        name: 'projectID',
        allowNull: false,
      },
      onDelete: 'cascade',
    });

    // Project can have many timesheets
    models.Idea.hasMany(models.Timesheet, {
      foreignKey: {
        name: 'projectID',
        allowNull: false,
      },
      onDelete: 'cascade',
    });
  };

  return Project;
};
