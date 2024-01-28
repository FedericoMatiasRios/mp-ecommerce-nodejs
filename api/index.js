const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
//const { MercadoPagoConfig, Preference } = require('mercadopago');
const mercadopago = require("mercadopago");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

/* const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
      integratorId: 'dev_24c65fb163bf11ea96500242ac130004',
  },
}); */

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  "x-integrator_id": "dev_24c65fb163bf11ea96500242ac130004",
  integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
});

mercadopago.configurations.setAccessToken(process.env.MERCADOPAGO_ACCESS_TOKEN);


// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/../views');

app.use('/assets', express.static(__dirname + '/../assets'));

app.get('/', function (req, res) {
    res.render('home', {view:'home'})
});

app.get('/detail', function (req, res) {
    try {
        const { id, title, img, unit, price } = req.query;

        const baseURL = 'https://mp-ecommerce-nodejs-theta.vercel.app/';

        const cleanedImagePath = img.replace('./', '');

        const fullURL = baseURL + cleanedImagePath;

        console.log(fullURL);

        res.render('detail', { view:'item', title, price, unit });


    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
});

app.get('/success', (req, res) => {
	res.render('success',{
		payment: req.query.payment_id,
		merchantOrder: req.query.merchant_order_id,
        paymentType: req.query.payment_type,
        externalReference: req.query.external_reference
	})
})

app.get('/failure', (req, res) => {
	res.render('failure',{
		payment: req.query.payment_id,
		merchantOrder: req.query.merchant_order_id,
        paymentType: req.query.payment_type,
        externalReference: req.query.external_reference
	})
})

app.get('/pending', (req, res) => {
	res.render('pending',{
		payment: req.query.payment_id,
		merchantOrder: req.query.merchant_order_id,
        paymentType: req.query.payment_type,
        externalReference: req.query.external_reference
	})
})

app.post("/notifications" , function (request, res) {
    console.log(request.body);
    res.status(200).send("Ok");
  });

  app.post('/create_preference', function (req, res) {

        let preference = {
          items: [
            {
              id: Number(1234),
              title: req.body.title,
              picture_url: ("https://mp-ecommerce-nodejs-theta.vercel.app" + req.body.img),
              description: 'Dispositivo móvil de Tienda e-commerce',
              quantity: Number(req.body.unit),
              unit_price: Number(req.body.price),
              currency_id: "ARS",
            }
          ],
          payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_36961754@testuser.com',
            phone: {
              area_code: '11',
              number: '2222-3333'
            },
            identification: {
              type: 'DNI',
              number: '22333444'
            },
            address: {
              street_name: 'calle falsa',
              street_number: 123,
              zip_code: '1040'
            }
          },
          back_urls: {
            success: 'https://mp-ecommerce-nodejs-theta.vercel.app/success',
            failure: 'https://mp-ecommerce-nodejs-theta.vercel.app/failure',
            pending: 'https://mp-ecommerce-nodejs-theta.vercel.app/pending'
          },
          auto_return: 'approved',
          payment_methods: {
          excluded_payment_methods: [
                    {
                              id: "visa"
                    }
          ],
          excluded_payment_types: [],
          installments: 6
          },
          notification_url: 'https://mp-ecommerce-nodejs-theta.vercel.app/notifications',
          statement_descriptor: 'MEUNEGOCIO',
          external_reference: 'federicomatiasrios@gmail.com',
        };
    
        mercadopago.preferences.create(preference)
              .then(function (response) {
            let id = response.body.id;
          res.redirect(response.body.init_point) 
            })
            .catch(function (error) {
                console.log(error);
              })
            })
              
app.listen(port);