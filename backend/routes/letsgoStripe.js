const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const LetsGoOrder = require("../models/letsgoOrder");
const LetsOrder = require("../models/letsOrder");

let sessionId;

// router.post("/create-checkout-session", async (req, res) => {
//   // console.log(req.body.cartItem);
//   const customer = await stripe.customers.create({
//     metadata: {
//       userId: req.body.userId,
//       cart: JSON.stringify(req.body.cartItem),
//     },
//   });
//   //   console.log(cart);
//   const line_items = req.body.cartItem.map((item) => {
//     return {
//       price_data: {
//         currency: "usd",
//         product_data: {
//           //   startDate: item.startDate,
//           //   endDate: item.endDate,
//           name: "Hilton Hotel", //
//           //   brand: "Luxury Hotel",
//           //   name: item.hotelId, //
//           //   images: item.image[0], //
//           description: item.desc, //
//           metadata: {
//             id: item.roomId, //
//           },
//         },
//         unit_amount: item.price * 100, //
//       },
//       quantity: item.cartQuantity, //
//     };
//   });
//   const session = await stripe.checkout.sessions.create({
//     phone_number_collection: {
//       enabled: true,
//     },
//     customer: customer.id,
//     line_items,
//     mode: "payment",
//     success_url: `${process.env.CLIENT_URL}/checkout-success`,
//     cancel_url: `${process.env.CLIENT_URL}`,
//   });
//   try {
//     const newOrder = new LetsOrder({
//       userId: req.body.userId,
//       customerId: session.customer,
//     });
//     await newOrder.save();
//     res.json(newOrder);
//   } catch (err) {
//     console.log("error from create checkout", err.messae);
//     res.status(500).send("Internal server error");
//   }
//   //   sessionId=session.id;
//   res.send({ url: session.url });
//   //   console.log("data from session",session);
// });

router.post("/create-checkout-session", async (req, res) => {
  try {
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
            name: "Hilton Hotel",
            description: item.desc,
            metadata: {
              id: item.roomId,
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
      cancel_url: `${process.env.CLIENT_URL}`,
    });

    const newOrder = new LetsOrder({
      userId: req.body.userId,
      customerId: session.customer,
    });

    await newOrder.save();

    res.send({ url: session.url });
  } catch (err) {
    console.log("error from create checkout", err.message);
    res.status(500).send("Internal server error");
  }
});


const createOrder = async (customer, data) => {
  // console.log("data from backend", data);
  // console.log("customer from backend", customer);
  try {
    const Items = JSON.parse(customer.metadata.cart);
    // const Items = customer.metadata.cart;
    // console.log(customer.metadata.cart);

    const newOrder = new LetsGoOrder({
      userId: customer.metadata.userId,
      customerId: data.customer,
      paymentIntentId: data.payment_intent,
      products: Items,
      subtotal: data.amount_subtotal,
      //   total: data.amount_total,
      //   email: data.customer_details.email,
      //   name: data.customer_details.name,
      //   phone: data.customer_details.phone,
      payment_status: data.payment_status,
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();
    // console.log("Order saved successfully:", savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    // Handle the error appropriately, e.g., send a response to the client or log it
    // You can also throw the error to propagate it to the calling function
    res.status(500).send("Internal server error");
  }
};

router.get("/get-order-details/:customerId/:userId", async (req, res) => {
  try {
    const order = await LetsGoOrder.findOne({
      customerId: req.params.customerId,
      userId: req.params.userId,
    });
    if (!order) {
      return res.status(404).send("Order not found");
    }
    return res.status(200).send(order);
    console.log("order",order);
  } catch (error) {
    console.error("Error retrieving order:", error);
    return res.status(500).send("Internal server error");
  }
});


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
          createOrder(customer, data);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
    response.send().end();
  }
);

module.exports = router;
