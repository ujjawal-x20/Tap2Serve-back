const Stripe = require('stripe');
const stripe = new Stripe(process.env.PAYMENT_KEY || process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const Restaurant = require('../models/Restaurant');
const logger = require('../utils/logger');
const WebhookEvent = require('../models/WebhookEvent');
const sendEmail = require('../utils/emailService');

// @desc    Create a Stripe Checkout Session
// @route   POST /api/v1/payments/create-session
// @access  Private (Restaurant Owner)
exports.createCheckoutSession = async (req, res, next) => {
    try {
        const { planId } = req.body;
        const restaurantId = req.user.restaurantId; // Assuming user has restaurantId attached

        // Find or create customer
        let subscription = await Subscription.findOne({ restaurantId });
        let customerId;

        if (subscription && subscription.stripeCustomerId) {
            customerId = subscription.stripeCustomerId;
        } else {
            const restaurant = await Restaurant.findById(restaurantId);
            const customer = await stripe.customers.create({
                email: req.user.email,
                name: restaurant.name,
                metadata: { restaurantId: restaurantId.toString() }
            });
            customerId = customer.id;
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planId, // This should be the Stripe Price ID
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/plans`,
            metadata: { restaurantId: restaurantId.toString() }
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        logger.error(`Checkout Session Error: ${error.message}`);
        next(error);
    }
};


// @desc    Stripe Webhook Handler
// @route   POST /api/v1/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        logger.error(`Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Pre-log the event
    let dbEvent;
    try {
        dbEvent = await WebhookEvent.create({
            stripeEventId: event.id,
            type: event.type,
            payload: event.data.object,
            status: 'received'
        });
    } catch (err) {
        if (err.code === 11000) {
            // Already received this event
            return res.json({ received: true, duplicate: true });
        }
        logger.error(`Webhook Logging Error: ${err.message}`);
    }

    try {
        const session = event.data.object;

        switch (event.type) {
            case 'checkout.session.completed':
                await updateSubscription(session);
                break;
            case 'invoice.payment_succeeded':
                // Handle recurring payment
                break;
            case 'customer.subscription.deleted':
                await cancelSubscription(session);
                break;
            default:
                logger.info(`Unhandled event type ${event.type}`);
        }

        // Mark as processed
        if (dbEvent) {
            dbEvent.status = 'processed';
            await dbEvent.save();
        }
    } catch (err) {
        logger.error(`Webhook Processing Error: ${err.message}`);
        if (dbEvent) {
            dbEvent.status = 'failed';
            dbEvent.error = err.message;
            await dbEvent.save();
        }

        // Email Alert to Admin
        try {
            await sendEmail({
                email: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                subject: 'CRITICAL: Webhook Processing Failed',
                message: `Webhook ${event.id} (${event.type}) failed to process. Error: ${err.message}`,
                html: `<h2>Webhook Failure</h2><p><b>Event ID:</b> ${event.id}</p><p><b>Type:</b> ${event.type}</p><p><b>Error:</b> ${err.message}</p>`
            });
        } catch (emailErr) {
            logger.error(`Failed to send webhook failure alert: ${emailErr.message}`);
        }

        // Still return 200 to Stripe to avoid infinite retries if we've logged the failure
        return res.status(200).json({ received: true, error: err.message });
    }

    res.json({ received: true });
};

async function updateSubscription(session) {
    const restaurantId = session.metadata.restaurantId;
    const stripeSubscriptionId = session.subscription;
    const stripeCustomerId = session.customer;

    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const planId = subscription.items.data[0].price.id;

    await Subscription.findOneAndUpdate(
        { restaurantId },
        {
            stripeCustomerId,
            stripeSubscriptionId,
            planId,
            status: 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        },
        { upsert: true }
    );

    // Also update Restaurant model plan
    let planName = 'Basic';
    if (planId.includes('premium')) planName = 'Premium';
    else if (planId.includes('standard')) planName = 'Standard';

    await Restaurant.findByIdAndUpdate(restaurantId, { plan: planName });

    // Send Activation Email
    try {
        const restaurant = await Restaurant.findById(restaurantId).populate('ownerId');
        if (restaurant && restaurant.ownerId) {
            await sendEmail({
                email: restaurant.ownerId.email,
                subject: 'Tap2Serve Subscription Activated',
                message: `Hello ${restaurant.ownerId.name}, your subscription for ${restaurant.name} is now active!`,
                html: `<h1>Welcome to Tap2Serve</h1><p>Your subscription for <b>${restaurant.name}</b> is now active.</p>`
            });
        }
    } catch (err) {
        logger.error(`Error sending activation email: ${err.message}`);
    }
}

async function cancelSubscription(session) {
    const stripeSubscriptionId = session.id;
    await Subscription.findOneAndUpdate(
        { stripeSubscriptionId },
        { status: 'canceled' }
    );
}
