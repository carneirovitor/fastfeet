import Mail from '../../lib/Mail';

class DeleteOrderMail {
  get key() {
    return 'DeleteOrderMail';
  }

  async handle({ data }) {
    const { name, email, product, recipient, city, zipcode } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Uma encomenda foi deletada pelo admnistrador.',
      text: 'ATENÇÃO: Uma encomenda atribuída a você foi deletada.',
      template: 'deleteorders',
      context: {
        product,
        recipient,
        city,
        zipcode,
      },
    });
  }
}

export default new DeleteOrderMail();
