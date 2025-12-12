import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Replace with your Razorpay keys
const razorpay = new Razorpay({
  key_id: "rzp_test_RqLuICluQJh2W4",
  key_secret: "cGGpo2HdV4lBVl7uv7K9dYN3"
   // ← your SECRET
});

// Create Order API
app.post("/createOrder", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Convert ₹ to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Verify Payment API
app.post("/verifyPayment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    res.json({ verified: true });
  } else {
    res.json({ verified: false });
  }
});

app.get("/", (req, res) => {
  res.send("Razorpay Backend Running");
});

// Render uses PORT environment variable
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
