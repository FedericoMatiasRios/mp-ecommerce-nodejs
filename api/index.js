const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    integratorId: 'dev_24c65fb163bf11ea96500242ac130004',
  });

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

        const preference = new Preference(client);

        preference.create({
          body: {
            items: [
              {
                id: Number(1234),
                title,
                picture_url: fullURL,
                description: 'Dispositivo móvil de Tienda e-commerce',
                quantity: Number(unit),
                unit_price: Number(price),
                currency_id: "ARS",
              }
            ],
            "payer": {
                "name": "Lalo",
                "surname": "Landa",
                "email": "test_user_36961754@testuser.com",
                "phone": {
                    "area_code": "011",
                    "number": Number(22223333)
                },
                "identification": {
                    "type": "DNI",
                    "number": "22333444"
                },
                "address": {
                    "street_name": "calle falsa",
                    "street_number": Number(123),
                    "zip_code": "1706"
                }
            },
            "back_urls": {
                "success": "https://mp-ecommerce-nodejs-theta.vercel.app/success",
                "failure": "https://mp-ecommerce-nodejs-theta.vercel.app/failure",
                "pending": "https://mp-ecommerce-nodejs-theta.vercel.app/pending"
            },
            "auto_return": "approved",
            "payment_methods": {
                "excluded_payment_methods": [
                    {
                        "id": "visa"
                    }
                ],
                "installments": 6
            },
            "notification_url": "https://mp-ecommerce-nodejs-theta.vercel.app/notifications",
            "external_reference": "federicomatiasrios@gmail.com",
            "expires": false,
          }
        })
        .then((preference) => {
            const initPoint = preference.init_point + "&redirect_mode=modal";
            console.log('init_point:', initPoint);

            console.log('preference:', preference);

            //res.redirect(initPoint);
            res.render('detail', { view:'detail', title, price, unit, preference, initPoint });
        })
        .catch((error) => {
            console.error('Error al crear preferencia:', error);
            res.status(500).json({ error: 'Error al procesar la solicitud' });
        });

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

app.listen(port);