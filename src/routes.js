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
import OrderIssueController from './app/controllers/OrderIssueController';
import OrderIssueCarrierController from './app/controllers/OrderIssueCarrierController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

/*
 * Carrier Routes
 */
routes.post('/orders/:id/problems', OrderIssueCarrierController.store);
routes.put(
  '/orders/:carrier_id/deliveries/:order_id',
  CarrierDeliveriesController.update
);
routes.get('/orders/:id/deliveries', CarrierDeliveriesController.index);

/*
 * Middlewares routes
 */
routes.use(authMiddleware);

/*
 * User routes
 */
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

/*
 * Recipient routes
 */
routes.post('/recipient', RecipientController.store);
routes.put('/recipient/:id', RecipientController.update);

/*
 * Carrier routes
 */
routes.get('/carriers', CarrierController.index);
routes.post('/carriers', CarrierController.store);
routes.put('/carriers/:id', CarrierController.update);
routes.delete('/carriers/:id', CarrierController.delete);

/*
 * File upload routes
 */
routes.post('/files', upload.single('file'), FileController.store);

/*
 * Orders routes
 */
routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:id', OrderController.update);

/*
 * Order Issues routes
 */
routes.get('/issue', OrderIssueController.index);
routes.delete('/issue/:id/cancel-delivery', OrderIssueController.delete);
routes.get('/issue/:id', OrderIssueController.show);

export default routes;
