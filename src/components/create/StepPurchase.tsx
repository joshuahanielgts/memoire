import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type ScentComposition } from "@/pages/CreatePage";
import { FORMAT_CATALOG, formatPrice, type FormatId } from "@/lib/pricing";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Hook to load Razorpay script
function useRazorpay() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
}

interface StepPurchaseProps {
  composition: ScentComposition;
  onCompleteOrder: (format: FormatId) => Promise<any>;
  isSubmittingOrder?: boolean;
  orderConfirmation?: {
    orderId: string;
    status: string;
    priceCents: number;
  } | null;
}

const StepPurchase = ({
  composition,
  onCompleteOrder,
  isSubmittingOrder = false,
  orderConfirmation = null,
}: StepPurchaseProps) => {
  useRazorpay();
  const { user, session } = useAuth();
  const initialIndex =
    FORMAT_CATALOG.findIndex((option) => option.id === composition.selectedFormat) >= 0
      ? FORMAT_CATALOG.findIndex((option) => option.id === composition.selectedFormat)
      : 0;
  const [selected, setSelected] = useState(initialIndex);
  const [paying, setPaying] = useState(false);

  // Payment handler (call after create-order returns order_id)
  const initiatePayment = async (
    orderId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    if (!session) {
      onError("Authentication session not found.");
      return;
    }
    setPaying(true);
    try {
      // 1. Get Razorpay order
      const initRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initiate-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: orderId }),
        }
      );

      if (!initRes.ok) {
        throw new Error("Failed to initiate Razorpay payment.");
      }

      const { razorpay_order_id, amount, key_id } = await initRes.json();

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: key_id,
        amount,
        currency: "INR",
        order_id: razorpay_order_id,
        name: "Memoire",
        description: "Luxury Fragrance Composition",
        handler: async (response: RazorpayResponse) => {
          try {
            // 3. Verify payment
            const verifyRes = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  order_id: orderId,
                  ...response,
                }),
              }
            );
            if (verifyRes.ok) {
              onSuccess();
            } else {
              onError("Payment verification failed. Contact support.");
            }
          } catch (err) {
            onError("Error verifying payment.");
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          email: user?.email ?? "",
          name: user?.user_metadata?.full_name ?? "",
        },
        theme: { color: "#1a1a1a" },
      });

      rzp.open();
    } catch (err) {
      onError("Payment initialization failed.");
      setPaying(false);
    }
  };

  const handlePurchaseSubmit = async () => {
    const format = FORMAT_CATALOG[selected].id;
    const orderData = await onCompleteOrder(format);

    if (!orderData || !orderData.order_id) {
      return;
    }

    await initiatePayment(
      orderData.order_id,
      () => {
        toast.success("Payment confirmed successfully! Your scent has been ordered.");
      },
      (msg) => {
        toast.error(msg);
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-4xl w-full space-y-12 animate-fade-in">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground/40 text-[10px] tracking-[0.3em] uppercase font-sans">
            {composition.id}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground font-light">
            {composition.name}
          </h2>
          <p className="text-muted-foreground text-sm font-light">
            Choose your bespoke fragrance format
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FORMAT_CATALOG.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => setSelected(i)}
              className={`border p-6 text-left flex flex-col justify-between transition-all duration-500 ${
                selected === i
                  ? "border-accent bg-secondary/30"
                  : "border-border/30 hover:border-accent/30"
              }`}
            >
              <div className="space-y-4">
                <h3 className="font-serif text-xl text-foreground">{opt.label}</h3>
                <p className="font-serif text-2xl text-foreground">
                  {formatPrice(opt.price_cents)}
                </p>
                <p className="text-muted-foreground text-xs font-light">
                  {opt.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 pt-4">
          <button
            onClick={() => void handlePurchaseSubmit()}
            disabled={isSubmittingOrder || paying}
            className="w-full md:w-auto bg-foreground text-background px-16 py-4 text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-all duration-500 font-sans disabled:opacity-60"
          >
            {isSubmittingOrder || paying ? "Processing..." : "Pay and Complete"}
          </button>
          {orderConfirmation && (
            <p className="text-center text-xs text-muted-foreground font-light">
              Order reference: {orderConfirmation.orderId} ({orderConfirmation.status}) -{" "}
              {formatPrice(orderConfirmation.priceCents)}
            </p>
          )}
          <Link
            to="/"
            className="text-muted-foreground/50 text-[10px] tracking-[0.2em] uppercase hover:text-foreground transition-colors duration-300 font-sans"
          >
            Return to Atelier
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="text-muted-foreground/40 text-[10px] tracking-[0.15em] uppercase hover:text-accent transition-colors duration-500 font-sans"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepPurchase;
