import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/actions/order.actions";

export async function POST(req: NextRequest) {
  //build webhook event
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string,
  );

  //check for successful payment
  if (event.type === "charge.succeeded") {
    const { object } = event.data;

    //Update order to be paid i n db
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: {
        id: object.id,
        status: "COMPLETED",
        email_address: object.billing_details.email!,
        pricePaid: (object.amount / 100).toFixed(),
      },
    });
    return NextResponse.json({ received: true });
  }
  return NextResponse.json({
    message: "event is not charged.succeeded",
  });
}
// need to set the webhook 12:15
