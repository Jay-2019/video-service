'use strict';
const { Model } = require('sequelize');
const { VIDEO_STATUS } = require('../constants/constants');

module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    static associate(models) {
      // we can define association here if needed
    }
  }
  Video.init({
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    encoding: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: VIDEO_STATUS.ACTIVE
    }
  }, {
    sequelize,
    modelName: 'Video',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Video;
};