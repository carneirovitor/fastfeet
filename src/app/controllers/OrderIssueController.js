import * as Yup from 'yup';

import OrderIssue from '../models/OrderIssue';
import Order from '../models/Order';
import Carrier from '../models/Carrier';
import Recipient from '../models/Recipient';
import File from '../models/File';
import CancellationOrderMail from '../jobs/CancellationOrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const orderIssue = await OrderIssue.findAll({
      attributes: ['id', 'description', 'created_at', 'updated_at'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'start_date'],
          include: [
            {
              model: Carrier,
              as: 'carrier',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  attributes: ['path', 'url'],
                },
              ],
            },
          ],
        },
      ],
      /*  where: {
        carrier_id: req.body.id,
      }, */
    });
    return res.json(orderIssue);
  }

  async show(req, res) {
    const orderIssue = await OrderIssue.findAll({
      attributes: ['id', 'description', 'created_at', 'updated_at'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'start_date'],
          include: [
            {
              model: Carrier,
              as: 'carrier',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  attributes: ['path', 'url'],
                },
              ],
            },
          ],
        },
      ],
      where: {
        order_id: req.params.id,
      },
    });
    return res.json(orderIssue);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      canceled_at: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const orderIssue = await OrderIssue.findByPk(req.params.id);

    if (!orderIssue) {
      return res.status(400).json({ error: 'Invalid OrderIssue' });
    }

    const order = await Order.findByPk(orderIssue.order_id);

    if (!order) {
      return res.status(400).json({ error: 'Invalid Order' });
    }

    console.log(orderIssue.order_id);
    await order.update(req.body);

    const carrier = await Carrier.findByPk(order.carrier_id);
    const recipient = await Recipient.findByPk(order.recipient_id);

    await Queue.add(CancellationOrderMail.key, {
      name: carrier.name,
      email: carrier.email,
      product: order.product,
      recipient: recipient.name,
      street: recipient.street,
      number: recipient.number,
      complement: recipient.complement,
      state: recipient.state,
      city: recipient.city,
      zipcode: recipient.zipcode,
    });

    return res.status(200).json({ message: 'Order cancelled with success.' });
  }
}

export default new OrderController();
