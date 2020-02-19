import Mail from '../../lib/Mail';

class CancellationOrderMail {
  get key() {
    return 'CancellationOrderMail';
  }

  async handle({ data }) {
    const { name, email, product, recipient, city, zipcode } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Uma encomenda foi cancelada pelo admnistrador.',
      text: 'ATENÇÃO: Uma encomenda atribuída a você foi cancelada.',
      template: 'cancellations',
      context: {
        product,
        recipient,
        city,
        zipcode,
      },
    });
  }
}

export default new CancellationOrderMail();
