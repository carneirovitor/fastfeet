import * as Yup from 'yup';

import Order from '../models/Order';
import Carrier from '../models/Carrier';
import Recipient from '../models/Recipient';
import File from '../models/File';

// import CancellationMail from '../jobs/CancellationMail';
// import Queue from '../../lib/Queue';

import Queue from '../../lib/Queue';
import NewOrderMail from '../jobs/NewOrderMail';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      attributes: [
        'carrier_id',
        'recipient_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'city', 'state', 'zipcode'],
        },
        {
          model: Carrier,
          as: 'carrier',
          attributes: ['name', 'email'],
          include: [
            {
              model: File,
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
      ],
      /*  where: {
        carrier_id: req.body.id,
      }, */
    });
    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      carrier_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const carrier = await Carrier.findOne({
      where: { id: req.body.carrier_id },
    });

    if (!carrier) {
      return res.status(400).json({ error: 'Invalid Carrier.' });
    }

    const recipient = await Recipient.findOne({
      where: { id: req.body.recipient_id },
    });

    if (!recipient) {
      return res.status(400).json({ error: 'Invalid Recipient.' });
    }

    const { product, recipient_id, carrier_id } = await Order.create(req.body);

    await Queue.add(NewOrderMail.key, {
      name: carrier.name,
      email: carrier.email,
      product,
      recipient: recipient.name,
      street: recipient.street,
      number: recipient.number,
      complement: recipient.complement,
      state: recipient.state,
      city: recipient.city,
      zipcode: recipient.zipcode,
    });

    return res.status(200).json({ product, recipient_id, carrier_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      carrier_id: Yup.string().required(),
      product: Yup.string().required(),
      canceled_at: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: "This order doesn't exist." });
    }

    const {
      id,
      recipient_id,
      carrier_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date,
    } = await order.update(req.body);

    return res.json({
      id,
      recipient_id,
      carrier_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date,
    });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Invalid Order' });
    }

    await order.destroy();

    const { name, city, zipcode } = await Recipient.findByPk(
      order.recipient_id
    );

    const carrier = await Carrier.findByPk(order.carrier_id);

    await Queue.add(NewOrderMail.key, {
      name: carrier.name,
      email: carrier.email,
      product: order.product,
      recipient: name,
      city,
      zipcode,
    });

    return res.json({ message: 'Order deleted with success' });
  }
}

export default new OrderController();
