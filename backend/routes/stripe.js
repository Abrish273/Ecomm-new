const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const Order = require("../models/order");

router.post("/create-checkout-session", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      cart: JSON.stringify(req.body.cartItem),
    },
  });
  const line_items = req.body.cartItem.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image],
          description: item.desc,
          metadata: {
            id: item.id,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.cartQuantity,
    };
  });
  const session = await stripe.checkout.sessions.create({
    phone_number_collection: {
      enabled: true,
    },
    customer: customer.id,
    line_items,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/checkout-success`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
  });

  res.send({ url: session.url });
});


const createOrder = async(customer, data) => {
  const Items = JSON.parse(customer.metadata.cart);
  // const Items = customer.metadata.cart;
  // console.log(customer.metadata.cart);

  const newOrder = new Order({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products: Items,
    subtotal: data.amount_subtotal,
    // total: data.amount_total,
    // shipping: data.customer_details,
    payment_status: data.payment_status,
  });
  try {
    const savedOrder = await newOrder.save()
    // console.log("Processed Payment", savedOrder)
  } catch (error) {
    console.log(error)
  }
}

// web hooks
let endpointSecret;

// endpointSecret = "whsec_c940b17484d116d96317659bba2ebe0a600b60876b1921888efed0a87d28b4c5";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let data;
    let eventType;

    if (endpointSecret) {
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret
        );
        console.log("Web hook verified");
      } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = request.body.data.object;
      eventType = request.body.type;
    }
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          // console.log(customer);
          // console.log("data:", data);
          createOrder(customer, data)
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
    response.send().end();
  }
);

module.exports = router;
