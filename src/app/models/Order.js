/* eslint-disable no-unused-vars */
import Sequelize, { Model } from 'sequelize';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
      },
      {
        sequelize,
        tableName: 'orders',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Carrier, {
      foreignKey: 'carrier_id',
      as: 'carrier',
    });

    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });

    this.belongsTo(models.File, { foreignKey: 'signature_id' });
  }
}

export default Order;
