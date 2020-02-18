import * as Yup from 'yup';
import Carrier from '../models/Carrier';
import File from '../models/File';

class CarrierController {
  async index(req, res) {
    const carriers = await Carrier.findAll({
      attributes: ['id', 'avatar_id', 'name', 'email'],
      include: [
        {
          model: File,
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    return res.json(carriers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const carrierExists = await Carrier.findOne({
      where: { email: req.body.email },
    });

    if (carrierExists) {
      return res.status(400).json({ error: 'Carrier already exists.' });
    }

    const { id, name, email } = await Carrier.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      avatar_id: Yup.string().required(),
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const carrier = await Carrier.findByPk(req.params.id);
    const { email } = req.body;

    if (email && email !== carrier.email) {
      const carrierExists = await Carrier.findOne({ where: { email } });

      if (carrierExists) {
        return res.status(400).json({ error: 'This email is already in use.' });
      }
    }

    const { id, name } = await carrier.update(req.body);

    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const carrier = await Carrier.findByPk(req.params.id);

    if (!carrier) {
      return res.status(400).json({ error: 'Invalid Carrier' });
    }

    await carrier.destroy();

    return res.json({ message: 'Courier deleted with success' });
  }
}

export default new CarrierController();
