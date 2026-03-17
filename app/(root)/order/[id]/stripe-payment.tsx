import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  ExpressCheckoutElement,
  LinkAuthenticationElement,
  PaymentElement,
  type StripeExpressCheckoutElementReadyEvent,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurreny } from "@/lib/utils";
import { SERVER_URL } from "@/lib/constants";
import Link from "next/link";

const StripePayment = ({
  priceInCents,
  orderId,
  clientSecret,
  mode = "stripe",
  title,
}: {
  priceInCents: number;
  orderId: string;
  clientSecret?: string | null;
  mode?: "stripe" | "applePay";
  title?: string;
}) => {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
  );

  const { theme, systemTheme } = useTheme();
  const [resolvedClientSecret, setResolvedClientSecret] = useState<
    string | null
  >(clientSecret ?? null);
  const [isLoadingClientSecret, setIsLoadingClientSecret] = useState(
    mode === "applePay" && !clientSecret
  );
  const [clientSecretError, setClientSecretError] = useState("");

  useEffect(() => {
    setResolvedClientSecret(clientSecret ?? null);
  }, [clientSecret]);

  useEffect(() => {
    if (mode !== "applePay" || resolvedClientSecret) return;

    let isMounted = true;

    const createApplePayPaymentIntent = async () => {
      try {
        setIsLoadingClientSecret(true);
        setClientSecretError("");

        const response = await fetch("/api/apple-pay/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Unable to prepare Apple Pay");
        }

        if (typeof data.clientSecret !== "string" || !data.clientSecret) {
          throw new Error("Missing client secret for Apple Pay");
        }

        if (!isMounted) return;
        setResolvedClientSecret(data.clientSecret);
      } catch (error) {
        if (!isMounted) return;
        setClientSecretError(
          error instanceof Error
            ? error.message
            : "Unable to prepare Apple Pay"
        );
      } finally {
        if (isMounted) {
          setIsLoadingClientSecret(false);
        }
      }
    };

    createApplePayPaymentIntent();

    return () => {
      isMounted = false;
    };
  }, [mode, orderId, resolvedClientSecret]);

  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");
    const [applePayAvailable, setApplePayAvailable] = useState<boolean | null>(
      mode === "applePay" ? null : true
    );

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();

      if (stripe == null || elements == null || email == null) return;

      setIsLoading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          if (
            error?.type === "card_error" ||
            error?.type === "validation_error"
          ) {
            setErrorMessage(error?.message ?? "An unknown error occurred");
          } else if (error) {
            setErrorMessage("An unknown error occurred");
          }
        })
        .finally(() => setIsLoading(false));
    };

    const handleExpressCheckoutReady = (
      event: StripeExpressCheckoutElementReadyEvent
    ) => {
      setApplePayAvailable(Boolean(event.availablePaymentMethods?.applePay));
    };

    const handleExpressCheckoutConfirm = async () => {
      if (stripe == null || elements == null) return;

      setIsLoading(true);

      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
          },
        })
        .then(({ error }) => {
          if (
            error?.type === "card_error" ||
            error?.type === "validation_error"
          ) {
            setErrorMessage(error?.message ?? "An unknown error occurred");
          } else if (error) {
            setErrorMessage("An unknown error occurred");
          }
        })
        .finally(() => setIsLoading(false));
    };

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-xl">
          {title ?? (mode === "applePay" ? "Apple Pay Checkout" : "Card Checkout")}
        </div>
        {errorMessage && <div className="text-destructive">{errorMessage}</div>}

        {mode === "applePay" ? (
          <div className="space-y-3">
            <ExpressCheckoutElement
              options={{
                paymentMethods: {
                  applePay: "always",
                  googlePay: "never",
                  paypal: "never",
                  link: "never",
                  amazonPay: "never",
                  klarna: "never",
                },
                buttonTheme: { applePay: "black" },
                buttonType: { applePay: "check-out" },
              }}
              onReady={handleExpressCheckoutReady}
              onConfirm={handleExpressCheckoutConfirm}
            />

            {applePayAvailable === false && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Apple Pay is not available on this device/browser. Use Safari
                with an active Apple Wallet, or{" "}
                <Link href="/payment-method" className="underline">
                  choose another payment method
                </Link>
                .
              </div>
            )}
          </div>
        ) : (
          <>
            <PaymentElement />
            <div>
              <LinkAuthenticationElement
                onChange={(e) => setEmail(e.value.email)}
              />
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={stripe == null || elements == null || isLoading}
            >
              {isLoading
                ? "Purchasing...."
                : `Purchase ${formatCurreny(priceInCents / 100)}`}
            </Button>
          </>
        )}
      </form>
    );
  };

  if (!resolvedClientSecret) {
    if (isLoadingClientSecret) {
      return (
        <div className="text-sm text-muted-foreground">
          Preparing Apple Pay checkout...
        </div>
      );
    }

    return (
      <div className="text-sm text-destructive">
        {clientSecretError ||
          "Unable to load payment details. Please refresh and try again."}
      </div>
    );
  }

  return (
    <Elements
      options={{
        clientSecret: resolvedClientSecret,
        appearance: {
          theme:
            theme === "dark"
              ? "night"
              : theme === "light"
              ? "stripe"
              : systemTheme === "light"
              ? "stripe"
              : "night",
        },
      }}
      stripe={stripePromise}
    >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;
