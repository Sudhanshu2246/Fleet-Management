const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");
const { generateOrgId } = require("../../utils/generateOrgId");

const Organization = sequelize.define(
  "Organization",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyType: {
      type: DataTypes.ENUM(
        "private_limited",
        "public_limited",
        "llp",
        "partnership",
        "sole_proprietorship",
        "ngo",
        "other",
      ),
      allowNull: false,
    },
    primaryContactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    primaryContactEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    primaryContactPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gstIn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gstLegalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gstEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gstPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gstAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gstDoc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    panImg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ["ownerId", "isActive"],
      },
      {
        fields: ["companyName"],
      },
    ],
    hooks: {
      beforeValidate: async (organization, options) => {
        // Only generate if not already set
        if (!organization.id) {
          // Find the last organization to get the latest id
          const lastOrg = await sequelize.models.Organization.findOne({
            order: [["createdAt", "DESC"]], 
            attributes: ["id"],
            transaction: options.transaction,
          });

          organization.id = generateOrgId(lastOrg ? lastOrg.id : null);
        }
      },
    },
  },
);

module.exports = Organization;
