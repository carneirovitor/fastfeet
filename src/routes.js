import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import CarrierController from './app/controllers/CarrierController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import CarrierDeliveriesController from './app/controllers/CarrierDeliveriesController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.put(
  '/orders/:carrier_id/deliveries/:order_id',
  CarrierDeliveriesController.update
);
routes.get('/orders/:id/deliveries', CarrierDeliveriesController.index);

// routes.get('/orders', OrderController.index);

routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.post('/recipient', RecipientController.store);
routes.put('/recipient/:id', RecipientController.update);

routes.get('/carriers', CarrierController.index);
routes.post('/carriers', CarrierController.store);
routes.put('/carriers/:id', CarrierController.update);
routes.delete('/carriers/:id', CarrierController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders', OrderController.delete);

export default routes;
