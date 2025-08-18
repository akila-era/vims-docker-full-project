'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class salesorderdetail extends Model {
    static associate(models) {
      salesorderdetail.belongsTo(models.salesorder, { foreignKey: 'OrderID' });
      salesorderdetail.belongsTo(models.product, { foreignKey: 'ProductID' });
    }
  }

  salesorderdetail.init({
    OrderID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'salesorders',
        key: 'OrderID'
      }
    },
    ProductID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'products',
        key: 'ProductID'
      }
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    UnitPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'salesorderdetail',
    timestamps: true, 
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt'
  });

  return salesorderdetail;
};
