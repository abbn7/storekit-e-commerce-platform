import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { useCreateOrder, useCreatePaymentIntent } from "@workspace/api-client-react";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEPS = ["Shipping", "Review", "Payment"];

interface ShippingForm {
  fullName: string; email: string; phone: string;
  line1: string; line2: string; city: string;
  state: string; postalCode: string; country: string;
}

export default function CheckoutPage() {
  return (
    <>
      <SignedIn>
        <CheckoutContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function CheckoutContent() {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: "", email: "", phone: "", line1: "", line2: "",
    city: "", state: "", postalCode: "", country: "US",
  });
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const createPaymentIntent = useCreatePaymentIntent();

  const shippingCost = subtotal >= 10000 ? 0 : 999;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shippingCost + tax;

  function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shipping.fullName || !shipping.line1 || !shipping.city || !shipping.postalCode) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setStep(1);
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) {
      toast({ title: "Please fill in payment details", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const piResult = await createPaymentIntent.mutateAsync({ data: { amount: total, currency: "usd" } });
      const paymentIntentId = (piResult as any).paymentIntentId ?? "pi_mock";

      const orderResult = await createOrder.mutateAsync({
        data: {
          userId: user!.id,
          items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
          shippingAddress: {
            fullName: shipping.fullName,
            line1: shipping.line1,
            line2: shipping.line2 || undefined,
            city: shipping.city,
            state: shipping.state,
            postalCode: shipping.postalCode,
            country: shipping.country,
            phone: shipping.phone,
          },
          stripePaymentIntentId: paymentIntentId,
        },
      });
      clearCart();
      setLocation(`/order-confirmation/${(orderResult as any).id}`);
    } catch (err) {
      toast({ title: "Order failed", description: "Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <p className="font-display text-3xl font-light text-muted-foreground mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Your bag is empty
          </p>
          <a href="/collections" className="inline-block bg-foreground text-background px-8 py-4 text-xs tracking-[0.2em] uppercase">
            Shop Now
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-light mb-10"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Checkout
        </motion.h1>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-12">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors ${
                  i === step ? "text-foreground font-medium" : i < step ? "text-accent cursor-pointer" : "text-muted-foreground"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition-colors ${
                  i === step ? "bg-foreground text-background border-foreground"
                    : i < step ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground"
                }`}>
                  {i < step ? "✓" : i + 1}
                </span>
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="w-12 h-px bg-border mx-3" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.form
                  key="shipping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleShippingSubmit}
                  className="space-y-4"
                >
                  <h2 className="font-medium tracking-wide mb-6">Shipping Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" value={shipping.fullName} onChange={e => setShipping(s => ({ ...s, fullName: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={shipping.email} onChange={e => setShipping(s => ({ ...s, email: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="line1">Address *</Label>
                      <Input id="line1" value={shipping.line1} onChange={e => setShipping(s => ({ ...s, line1: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label htmlFor="line2">Apartment, suite, etc.</Label>
                      <Input id="line2" value={shipping.line2} onChange={e => setShipping(s => ({ ...s, line2: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={shipping.state} onChange={e => setShipping(s => ({ ...s, state: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input id="postalCode" value={shipping.postalCode} onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={shipping.country} onChange={e => setShipping(s => ({ ...s, country: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" className="flex items-center justify-center gap-2 w-full bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors mt-6">
                    Continue to Review <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}

              {step === 1 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="font-medium tracking-wide mb-6">Review Your Order</h2>
                  <div className="space-y-4 mb-8">
                    {items.map(item => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                        <div className="w-16 h-20 bg-muted flex-shrink-0 overflow-hidden">
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted p-5 mb-6 text-sm space-y-1">
                    <p className="font-medium mb-2">Shipping to:</p>
                    <p>{shipping.fullName}</p>
                    <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}</p>
                    <p>{shipping.city}, {shipping.state} {shipping.postalCode}</p>
                    <p>{shipping.country}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="flex items-center gap-2 px-6 py-4 border border-border text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors">
                      Continue to Payment <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handlePlaceOrder}
                  className="space-y-4"
                >
                  <h2 className="font-medium tracking-wide mb-6">Payment Details</h2>
                  <div className="space-y-1.5">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim())}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input id="expiry" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" value={cvc} onChange={e => setCvc(e.target.value)} maxLength={4} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-4 border border-border text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-4 text-xs tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors disabled:opacity-60">
                      {isSubmitting ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="bg-card border border-border p-6 h-fit">
            <h3 className="text-sm font-medium tracking-[0.1em] uppercase mb-5">Summary</h3>
            <div className="space-y-2.5 text-sm mb-5 pb-5 border-b border-border">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(tax)}</span></div>
            </div>
            <div className="flex justify-between font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
