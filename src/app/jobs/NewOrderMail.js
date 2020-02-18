import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const {
      name,
      email,
      product,
      recipient,
      street,
      number,
      complement,
      city,
      state,
      zipcode,
    } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Temos um pedido para você!',
      text: 'Você tem uma nova encomenda.',
      template: 'neworders',
      context: {
        name,
        product,
        recipient,
        street,
        number,
        complement,
        city,
        state,
        zipcode,
      },
    });
  }
}

export default new NewOrderMail();
