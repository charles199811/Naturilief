import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { formatError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { orderId?: string };
    if (!body.orderId) {
      return NextResponse.json(
        { message: "Order id is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: body.orderId },
      select: {
        id: true,
        userId: true,
        totalPrice: true,
        paymentMethod: true,
        isPaid: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const isOwner = order.userId === userId;
    const isAdmin = session.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (order.paymentMethod !== "ApplePay") {
      return NextResponse.json(
        { message: "Order is not configured for Apple Pay" },
        { status: 400 }
      );
    }

    if (order.isPaid) {
      return NextResponse.json(
        { message: "Order is already paid" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      metadata: { orderId: order.id },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json(
      { message: formatError(error) },
      { status: 500 }
    );
  }
}
