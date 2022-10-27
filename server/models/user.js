//server/medels/user.js
const Sequelize = require("sequelize");

/* 사용자 정보 DB */
module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        address: {
          type: Sequelize.STRING(200),
          allowNull: false,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        count: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "user",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {}
};
