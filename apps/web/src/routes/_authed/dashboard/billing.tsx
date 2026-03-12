import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CreditCard,
  Check,
  ArrowLeft,
  Sparkles,
  Zap,
  Users,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/_authed/dashboard/billing")({
  component: BillingPage,
});

interface Subscription {
  plan: "free" | "pro" | "team";
  status: "active" | "canceled" | "past_due" | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Nexus",
    features: [
      "2,000 API calls/month",
      "1 API key",
      "5 memories",
      "Basic documentation search",
      "Community support",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For power users and developers",
    features: [
      "Unlimited API calls",
      "10 API keys",
      "Unlimited memories",
      "Priority documentation indexing",
      "Advanced search filters",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$5",
    period: "/user/month",
    description: "For teams building together",
    features: [
      "Everything in Pro",
      "Shared team memories",
      "Team API key management",
      "Admin dashboard",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact Us",
    highlighted: false,
  },
];

function BillingPage() {
  const { session } = Route.useRouteContext();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Mock subscription data for now
      setSubscription({
        plan: "free",
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
      setLoading(false);
    }
  }, [session]);

  async function handleUpgrade(planId: string) {
    if (planId === "team") {
      // Open contact form or email
      window.open("mailto:hello@nexus.yogan.dev?subject=Team Plan Inquiry", "_blank");
      return;
    }

    setUpgrading(true);
    try {
      // TODO: Implement Stripe checkout
      // const res = await authFetch("/api/billing/checkout", {
      //   method: "POST",
      //   body: JSON.stringify({ planId }),
      // });
      // const { url } = await res.json();
      // window.location.href = url;
      
      // For now, show a coming soon message
      alert("Stripe integration coming soon! Pro plan will be $5/month.");
    } catch (err) {
      console.error("Failed to start checkout:", err);
    } finally {
      setUpgrading(false);
    }
  }

  async function handleManageBilling() {
    try {
      // TODO: Implement Stripe portal
      // const res = await authFetch("/api/billing/portal", { method: "POST" });
      // const { url } = await res.json();
      // window.location.href = url;
      alert("Billing portal coming soon!");
    } catch (err) {
      console.error("Failed to open billing portal:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan Status */}
      {subscription && subscription.plan !== "free" && (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {subscription.plan === "pro" ? "Pro Plan" : "Team Plan"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {subscription.cancelAtPeriodEnd 
                    ? `Cancels on ${new Date(subscription.currentPeriodEnd!).toLocaleDateString()}`
                    : subscription.currentPeriodEnd 
                      ? `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : "Active subscription"
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Manage Billing
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          
          {subscription.status === "past_due" && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Your payment is past due. Please update your payment method.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-lg border p-6 ${
                plan.highlighted
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  {plan.id === "free" && <Sparkles className="h-5 w-5 text-muted-foreground" />}
                  {plan.id === "pro" && <Zap className="h-5 w-5 text-primary" />}
                  {plan.id === "team" && <Users className="h-5 w-5 text-purple-600" />}
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                disabled={isCurrentPlan || upgrading}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isCurrentPlan
                    ? "cursor-default border border-border bg-muted text-muted-foreground"
                    : plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {isCurrentPlan ? "Current Plan" : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium text-foreground">What payment methods do you accept?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We accept all major credit cards via Stripe, including Visa, Mastercard, and American Express.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium text-foreground">Can I cancel anytime?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yes! You can cancel your subscription at any time. You'll retain access until the end of your billing period.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium text-foreground">What happens if I exceed my limits?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              On the free plan, API calls will be rate limited once you reach your monthly limit. Upgrade to Pro for unlimited usage.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium text-foreground">Is memory storage included?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Yes! Memory storage is included in all plans. Free users get 5 memories, while Pro and Team users get unlimited memories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
