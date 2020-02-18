import * as Yup from 'yup';
import { setHours, getHours, parseISO } from 'date-fns';
import { Op, fn, col } from 'sequelize';
import Order from '../models/Order';
import Carrier from '../models/Carrier';
import Recipient from '../models/Recipient';
import File from '../models/File';

class CarrierDeliveriesController {
  async index(req, res) {
    const carrier = await Carrier.findByPk(req.params.id);

    if (!carrier) {
      return res.status(400).json({ error: 'Invalid Carrier.' });
    }

    const orders = await Order.findAll({
      attributes: ['product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name', 'city', 'state', 'zipcode'],
        },
        {
          model: File,
          as: 'signatures',
          attributes: ['name', 'path', 'url'],
        },
      ],
      where: {
        carrier_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
    });
    return res.json(orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.string(),
      end_date: Yup.string(),
      signature_id: Yup.number(),
    });

    /*
     * Validando o req.body
     */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { carrier_id, order_id } = req.params;
    const { start_date, end_date, signature_id } = req.body;

    /*
     * Validando o carrier_id
     */
    const carrier = Carrier.findByPk(carrier_id);

    if (!carrier) {
      return res.status(400).json({ error: 'Invalid Carrier.' });
    }

    /*
     * Validando o order_id
     */
    const orders = await Order.findOne({
      attributes: ['id', 'product', 'start_date', 'end_date', 'signature_id'],
      where: {
        id: order_id,
        carrier_id,
      },
    });

    if (!orders.id) {
      return res.status(400).json({ error: 'Invalid order.' });
    }

    /*
     * Update no start_date
     */
    if (start_date) {
      const parsedStartDate = parseISO(start_date);

      const { n_orders } = await Order.findAll({
        attributes: [[fn('COUNT', col('id')), 'n_orders'], 'carrier_id'],
        where: {
          end_date: null,
          carrier_id,
          start_date: {
            [Op.between]: [
              setHours(parsedStartDate, 8),
              setHours(parsedStartDate, 18),
            ],
          },
        },
        group: 'carrier_id',
      });

      if (n_orders > 5) {
        return res.status(401).json({
          error: 'You only can pickup 5 packages in a day',
        });
      }

      const startDateHour = getHours(parsedStartDate);

      if (startDateHour > 18 || startDateHour < 8) {
        return res.status(401).json({
          error: 'You only can pickup a package between 08:00a.m and 06:00p.m.',
        });
      }

      await Order.update(
        {
          start_date: parsedStartDate,
        },
        {
          where: {
            id: order_id,
          },
        }
      );

      const orderUpdated = await Order.findByPk(order_id);
      return res.status(200).json(orderUpdated);
    }

    if (end_date) {
      const parsedEndDate = parseISO(end_date);

      if (!signature_id) {
        return res.status(401).json({
          error:
            'You only can finish a delivery uploading a signature of receiver',
        });
      }

      await Order.update(
        { end_date: parsedEndDate, signature_id },
        { where: { id: order_id } }
      );

      const orderUpdated = await Order.findByPk(order_id);

      return res.status(200).json(orderUpdated);
    }
    return res.status(400).json({ error: 'You must update a field.' });
  }
}

export default new CarrierDeliveriesController();
