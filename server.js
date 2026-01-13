import express from "express";
import Stripe from "stripe";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
const stripe = new Stripe("YOUR_STRIPE_SECRET_KEY");

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_GMAIL@gmail.com",
    pass: "YOUR_GMAIL_APP_PASSWORD"
  }
});

app.post("/create-checkout-session", async (req, res) => {
  const { email } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Reselling Link Access" },
          unit_amount: 999
        },
        quantity: 1
      }
    ],
    success_url: "http://localhost:4242/success.html",
    cancel_url: "http://localhost:4242/cancel.html"
  });

  // Send email
  await transporter.sendMail({
    from: "YOUR_GMAIL@gmail.com",
    to: email,
    subject: "Your Reselling Access Link 🔓",
    html: `
      <h2>Access Granted</h2>
      <p>Here is your private reselling link:</p>
      <a href="https://YOUR_RESELLING_LINK.com">Click Here</a>
      <p>Do not share this link.</p>
    `
  });

  res.json({ id: session.id });
});

app.listen(4242, () =>
  console.log("Running on http://localhost:4242")
);
