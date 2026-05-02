import { Router } from "express";

const router = Router();

router.post("/create-intent", async (req, res): Promise<void> => {
  try {
    const { amount, currency = "usd", metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any });
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    } else {
      // Development mode — return a mock payment intent
      const mockId = `pi_mock_${Date.now()}`;
      res.json({ clientSecret: `${mockId}_secret_mock`, paymentIntentId: mockId });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to create payment intent");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
