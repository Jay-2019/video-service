'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ShareableLink extends Model {
    static associate(models) {
      ShareableLink.belongsTo(models.Video, {
        foreignKey: 'videoId',
        as: 'video',
      });
    }
  }
  ShareableLink.init({
    linkId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    videoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Videos',
        key: 'id',
      },
    },
    ttl: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ShareableLink',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ShareableLink;
};