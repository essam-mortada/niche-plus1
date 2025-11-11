const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession({
  type, // 'subscription', 'nomination', 'ticket'
  userId,
  metadata = {},
  successUrl,
  cancelUrl,
  amount = null, // for one-time payments
  currency = "usd",
}) {
  try {
    const sessionConfig = {
      mode: type === "subscription" ? "subscription" : "payment",
      customer_email: metadata.userEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId.toString(),
        type,
        ...metadata,
      },
    };

    if (type === "subscription") {
      // Publisher Pack subscription
      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Publisher Pack",
              description: "Monthly subscription for 3 marketplace ad credits",
            },
            unit_amount: 50000, // $500 in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ];
    } else {
      // One-time payment for nominations or tickets
      sessionConfig.line_items = [
        {
          price_data: {
            currency,
            product_data: {
              name: type === "nomination" ? "Award Nomination" : "Event Ticket",
              description: metadata.description || "",
            },
            unit_amount: amount,
          },
          quantity: metadata.quantity || 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return session;
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw new Error("Failed to create checkout session");
  }
}

export async function createCustomer(email, name, metadata = {}) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return customer;
  } catch (error) {
    console.error("Stripe customer creation error:", error);
    throw new Error("Failed to create customer");
  }
}

export async function retrieveSession(sessionId) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("Stripe session retrieval error:", error);
    throw new Error("Failed to retrieve session");
  }
}

export async function createRefund(
  paymentIntentId,
  amount = null,
  reason = "requested_by_customer",
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // if null, refunds full amount
      reason,
    });
    return refund;
  } catch (error) {
    console.error("Stripe refund error:", error);
    throw new Error("Failed to create refund");
  }
}

export async function cancelSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Stripe subscription cancellation error:", error);
    throw new Error("Failed to cancel subscription");
  }
}

export async function updateSubscription(subscriptionId, params) {
  try {
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      params,
    );
    return subscription;
  } catch (error) {
    console.error("Stripe subscription update error:", error);
    throw new Error("Failed to update subscription");
  }
}

export function generateQRCode(ticketId, eventName) {
  // Simple QR code data - in production, use a proper QR library
  const qrData = `TICKET:${ticketId}:${eventName}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
}
