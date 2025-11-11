import sql from "@/app/api/utils/sql";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  console.log("Stripe webhook event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session) {
  const { customer, subscription, metadata, amount_total, currency } = session;
  const { user_id, type } = metadata;

  console.log("Processing checkout completion:", {
    user_id,
    type,
    amount_total,
  });

  if (type === "subscription") {
    // Handle subscription purchase
    await handleSubscriptionCheckout(session);
  } else if (type === "nomination") {
    // Handle nomination payment
    await handleNominationPayment(session);
  } else if (type === "ticket") {
    // Handle ticket purchase
    await handleTicketPurchase(session);
  }

  // Record payment
  await sql`
    INSERT INTO payments (user_id, type, amount, currency, status, stripe_session_id, metadata)
    VALUES (${user_id}, ${type}, ${amount_total}, ${currency.toUpperCase()}, 'succeeded', ${session.id}, ${JSON.stringify(metadata)})
    ON CONFLICT (stripe_session_id) DO NOTHING
  `;
}

async function handleSubscriptionCheckout(session) {
  const { customer, subscription, metadata } = session;
  const { user_id } = metadata;

  try {
    // Get or create supplier record
    const [existingSupplier] = await sql`
      SELECT s.*, u.email FROM suppliers s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ${user_id}
    `;

    let supplierId;
    if (existingSupplier) {
      supplierId = existingSupplier.id;
    } else {
      // Create supplier record if it doesn't exist
      const [newSupplier] = await sql`
        INSERT INTO suppliers (user_id, kyc_status)
        VALUES (${user_id}, 'pending')
        RETURNING id
      `;
      supplierId = newSupplier.id;
    }

    // Create or update subscription record
    const currentPeriod = new Date();
    const nextPeriod = new Date();
    nextPeriod.setMonth(nextPeriod.getMonth() + 1);

    await sql`
      INSERT INTO subscriptions (
        supplier_id, plan_name, price_usd, status, 
        current_period_start, current_period_end,
        credits_total, credits_used,
        stripe_customer_id, stripe_subscription_id
      )
      VALUES (
        ${supplierId}, 'Publisher Pack', 50000, 'active',
        ${currentPeriod}, ${nextPeriod},
        3, 0,
        ${customer}, ${subscription}
      )
      ON CONFLICT (supplier_id) DO UPDATE SET
        status = 'active',
        current_period_start = ${currentPeriod},
        current_period_end = ${nextPeriod},
        credits_total = 3,
        credits_used = 0,
        stripe_customer_id = ${customer},
        stripe_subscription_id = ${subscription},
        updated_at = CURRENT_TIMESTAMP
    `;

    console.log("Subscription created/updated for supplier:", supplierId);
  } catch (error) {
    console.error("Error handling subscription checkout:", error);
    throw error;
  }
}

async function handleNominationPayment(session) {
  const { metadata } = session;
  const { nomination_id } = metadata;

  try {
    // Update nomination payment status
    await sql`
      UPDATE nominations 
      SET payment_status = 'paid', stripe_session_id = ${session.id}
      WHERE id = ${nomination_id}
    `;

    console.log("Nomination payment completed:", nomination_id);
  } catch (error) {
    console.error("Error handling nomination payment:", error);
    throw error;
  }
}

async function handleTicketPurchase(session) {
  const { metadata } = session;
  const { ticket_id, award_name } = metadata;

  try {
    // Generate QR code
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`TICKET:${ticket_id}:${award_name}`)}`;

    // Update ticket payment status and generate QR code
    await sql`
      UPDATE tickets 
      SET payment_status = 'paid', 
          stripe_session_id = ${session.id},
          qr_code = ${qrCode}
      WHERE id = ${ticket_id}
    `;

    console.log("Ticket purchase completed:", ticket_id);
  } catch (error) {
    console.error("Error handling ticket purchase:", error);
    throw error;
  }
}

async function handleInvoicePaid(invoice) {
  const { customer, subscription } = invoice;

  try {
    // Reset credits for the subscription period
    await sql`
      UPDATE subscriptions 
      SET credits_used = 0,
          status = 'active',
          updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscription}
    `;

    console.log("Invoice paid, credits reset for subscription:", subscription);
  } catch (error) {
    console.error("Error handling invoice paid:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  const { id, status, current_period_start, current_period_end } = subscription;

  try {
    await sql`
      UPDATE subscriptions 
      SET status = ${status},
          current_period_start = ${new Date(current_period_start * 1000)},
          current_period_end = ${new Date(current_period_end * 1000)},
          updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${id}
    `;

    console.log("Subscription updated:", id, status);
  } catch (error) {
    console.error("Error handling subscription update:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription) {
  const { id } = subscription;

  try {
    await sql`
      UPDATE subscriptions 
      SET status = 'canceled',
          updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${id}
    `;

    console.log("Subscription canceled:", id);
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
    throw error;
  }
}

async function handlePaymentFailed(invoice) {
  const { subscription } = invoice;

  try {
    // Mark subscription as past due
    await sql`
      UPDATE subscriptions 
      SET status = 'past_due',
          updated_at = CURRENT_TIMESTAMP
      WHERE stripe_subscription_id = ${subscription}
    `;

    console.log("Payment failed, subscription marked past due:", subscription);
  } catch (error) {
    console.error("Error handling payment failure:", error);
    throw error;
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  const { id, amount, currency, metadata } = paymentIntent;

  try {
    // Record successful payment if not already recorded
    if (metadata?.user_id) {
      await sql`
        INSERT INTO payments (user_id, type, amount, currency, status, stripe_payment_intent_id, metadata)
        VALUES (${metadata.user_id}, ${metadata.type || "unknown"}, ${amount}, ${currency.toUpperCase()}, 'succeeded', ${id}, ${JSON.stringify(metadata)})
        ON CONFLICT (stripe_payment_intent_id) DO NOTHING
      `;
    }

    console.log("Payment succeeded:", id);
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}
