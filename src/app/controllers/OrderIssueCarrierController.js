import * as Yup from 'yup';

import OrderIssue from '../models/OrderIssue';
import Order from '../models/Order';
import Carrier from '../models/Carrier';

class OrderIssueCarrierController {
  async store(req, res) {
    const schema = Yup.object().shape({
      order_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { order_id, description } = req.body;

    const carrier = await Carrier.findByPk(req.params.id);

    if (!carrier) {
      return res.status(400).json({ error: 'Invalid Carrier' });
    }

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(400).json({ error: 'Invalid Order' });
    }

    const orderIssue = await OrderIssue.create({
      description,
      order_id,
      carrier_id: carrier.id,
    });

    return res.json(orderIssue);
  }
}

export default new OrderIssueCarrierController();
