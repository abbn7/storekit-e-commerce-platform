import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { pageVariants } from "@/lib/animations";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import CollectionsPage from "@/pages/CollectionsPage";
import CollectionDetailPage from "@/pages/CollectionDetailPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import SearchPage from "@/pages/SearchPage";
import AccountPage from "@/pages/AccountPage";
import AccountOrdersPage from "@/pages/AccountOrdersPage";
import AccountWishlistPage from "@/pages/AccountWishlistPage";
import AboutPage from "@/pages/AboutPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminProductFormPage from "@/pages/admin/AdminProductFormPage";
import AdminCollectionsPage from "@/pages/admin/AdminCollectionsPage";
import AdminCollectionFormPage from "@/pages/admin/AdminCollectionFormPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "@/pages/admin/AdminOrderDetailPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminContentPage from "@/pages/admin/AdminContentPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import CartDrawer from "@/components/CartDrawer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

function AnimatedRoutes() {
  const [location] = useLocation();
  const routeKey = location.split("/").slice(0, 2).join("/") || "/";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: "100vh" }}
      >
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/collections" component={CollectionsPage} />
          <Route path="/collections/:slug" component={CollectionDetailPage} />
          <Route path="/products/:slug" component={ProductDetailPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/order-confirmation/:id" component={OrderConfirmationPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/account" component={AccountPage} />
          <Route path="/account/orders" component={AccountOrdersPage} />
          <Route path="/account/wishlist" component={AccountWishlistPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/sign-in" component={SignInPage} />
          <Route path="/sign-up" component={SignUpPage} />
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin" component={AdminDashboardPage} />
          <Route path="/admin/products" component={AdminProductsPage} />
          <Route path="/admin/products/new" component={AdminProductFormPage} />
          <Route path="/admin/products/:id/edit" component={AdminProductFormPage} />
          <Route path="/admin/collections" component={AdminCollectionsPage} />
          <Route path="/admin/collections/new" component={AdminCollectionFormPage} />
          <Route path="/admin/collections/:id/edit" component={AdminCollectionFormPage} />
          <Route path="/admin/orders" component={AdminOrdersPage} />
          <Route path="/admin/orders/:id" component={AdminOrderDetailPage} />
          <Route path="/admin/settings" component={AdminSettingsPage} />
          <Route path="/admin/content" component={AdminContentPage} />
          <Route path="/admin/analytics" component={AdminAnalyticsPage} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function ClerkAwareRouter() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? ""}
      routerPush={(to) => setLocation(to)}
      routerReplace={(to) => setLocation(to, { replace: true })}
    >
      <AnimatedRoutes />
      <CartDrawer />
    </ClerkProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <ClerkAwareRouter />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
