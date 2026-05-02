import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import storeConfigRouter from "./store-config";
import productsRouter from "./products";
import collectionsRouter from "./collections";
import searchRouter from "./search";
import ordersRouter from "./orders";
import wishlistRouter from "./wishlist";
import paymentRouter from "./payment";
import testimonialsRouter from "./testimonials";
import adminAuthRouter from "./admin/auth";
import adminProductsRouter from "./admin/products";
import adminCollectionsRouter from "./admin/collections";
import adminOrdersRouter from "./admin/orders";
import adminSettingsRouter from "./admin/settings";
import adminAnalyticsRouter from "./admin/analytics";
import adminContentRouter from "./admin/content";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use("/store-config", storeConfigRouter);
router.use("/products", productsRouter);
router.use("/collections", collectionsRouter);
router.use("/search", searchRouter);
router.use("/orders", ordersRouter);
router.use("/wishlist", wishlistRouter);
router.use("/payments", paymentRouter);
router.use("/testimonials", testimonialsRouter);

// Admin routes
router.use("/admin/auth", adminAuthRouter);
router.use("/admin/products", adminProductsRouter);
router.use("/admin/collections", adminCollectionsRouter);
router.use("/admin/orders", adminOrdersRouter);
router.use("/admin/settings", adminSettingsRouter);
router.use("/admin/analytics", adminAnalyticsRouter);
router.use("/admin/content", adminContentRouter);

export default router;
