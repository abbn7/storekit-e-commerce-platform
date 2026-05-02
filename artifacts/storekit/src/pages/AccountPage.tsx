import { motion } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { SignedIn, SignedOut, RedirectToSignIn, useUser, UserButton } from "@clerk/react";
import { Package, Heart, Settings, ChevronRight } from "lucide-react";

function AccountContent() {
  const { user } = useUser();
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-5 mb-12 pb-8 border-b border-border">
            <UserButton appearance={{ elements: { avatarBox: "w-16 h-16" } }} />
            <div>
              <h1 className="font-display text-3xl font-light" style={{ fontFamily: "var(--font-display)" }}>
                {user?.firstName ?? "My Account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Package, label: "My Orders", desc: "Track and manage your orders", href: "/account/orders" },
              { icon: Heart, label: "Wishlist", desc: "Items you've saved for later", href: "/account/wishlist" },
            ].map(({ icon: Icon, label, desc, href }) => (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex items-center justify-between p-6 bg-card border border-border hover:border-foreground/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

export default function AccountPage() {
  return (
    <>
      <SignedIn><AccountContent /></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
