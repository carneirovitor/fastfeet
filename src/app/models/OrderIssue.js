/* eslint-disable no-unused-vars */
import Sequelize, { Model } from 'sequelize';

class OrderIssue extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        carrier_id: Sequelize.VIRTUAL,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order',
    });

    this.belongsTo(models.Carrier, {
      foreignKey: 'carrier_id',
      as: 'carrier',
    });
  }
}

export default OrderIssue;
