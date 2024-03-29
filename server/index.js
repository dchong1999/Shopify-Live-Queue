const express = require('express');
const path = require('path');
require('dotenv').config();
const {SHOP, TOKEN} = process.env;
const db = require('../database/index.js');

const axios = require('axios');
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['X-Shopify-Access-Token'] = `${TOKEN}`;

const app = express();

app.use(express.static('./dist'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Make API call to Shopify
app.get('/getUpdates', (req, res) => {
  var date = new Date();
  date.setDate(date.getDate()-3);
  return axios.get(`https://${SHOP}.myshopify.com/admin/api/2022-10/orders.json?status=open&fields=order_number,customer&created_at_min=${date.toISOString().slice(0,10)}T00:00:00.000Z`)
    .then((response) => {
      var customers = [];
      response.data.orders.forEach((order) => {
        customers.unshift([order.order_number, `${order.customer.first_name} ${order.customer.last_name[0]}`]);
      });
      db.getUpdates(customers)
        .then((response) => {
          res.send(response);
        });
    })
    .catch((error) => console.log('getUpdates S > API ERROR: ', error));
});

//Make call to get unfulfilled orders from db
app.get('/getQueue', (req, res) => {
  return db.getQueue()
    .then((response) => {
      res.send(response);
    })
    .catch((error) => console.log('getQueue S > D ERROR: ', error));
});

//Make call to get all orders from db
app.get('/getAll', (req, res) => {
  return db.getAll()
    .then((response) => {
      res.send(response);
    })
    .catch((error) => console.log('getAll S > D ERROR: ', error));
});

//Make call to remove entries from db
app.get('/reset', (req, res) => {
  return db.reset()
    .then((response) => {
      res.send(response);
    })
    .catch((error) => console.log('reset S > D ERROR: ', error));
});

//Make call to mark order as complete
app.put('/markCompleted', (req, res) => {
  return db.markCompleted(req.body.OrderNo)
    .then((response) => {
      res.sendStatus(200);
    })
    .catch((error) => console.log('markCompleted S > D ERROR: ', error));
});

//Make call to mark order as not complete
app.put('/markNotCompleted', (req, res) => {
  return db.markNotCompleted(req.body.OrderNo)
    .then((response) => {
      res.sendStatus(200);
    })
    .catch((error) => console.log('markNotCompleted S > D ERROR: ', error));
});


app.listen(3000);
console.log('Listening on port 3000');
