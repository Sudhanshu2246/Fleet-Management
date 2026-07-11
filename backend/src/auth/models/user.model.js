const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
       type: DataTypes.STRING,
       allowNull: false,
       unique: true,
       validate: {
        isEmail: true,
       },
       set(value) {
        this.setDataValue("email", value.toLowerCase().trim());
       },
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM(
        "super_admin", 
        "company_admin", 
        "driver",
        "co_driver"
      ),
      allowNull: false,
      defaultValue: "driver",
    },

    organizationId: {
      type: DataTypes.STRING,
      allowNull: true
    },
  },
  {
    timestamps: true
  }
);

module.exports = User;