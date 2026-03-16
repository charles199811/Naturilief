import { Metadata } from "next";
import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  let client_secret = null;
  const isStripeBasedPayment =
    order.paymentMethod === "Stripe" ||
    order.paymentMethod === "ApplePay";

  // Check if not paid and using a Stripe-powered method
  if (isStripeBasedPayment && !order.isPaid) {
    //Init stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      metadata: { orderId: order.id },
    };

    if (order.paymentMethod === "ApplePay") {
      paymentIntentParams.automatic_payment_methods = { enabled: true };
    } else {
      paymentIntentParams.payment_method_types = ["card"];
    }

    //Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams
    );

    client_secret = paymentIntent.client_secret;
  }

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"} //sb is a identifier for sandbox account
      isAdmin={session?.user.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
