import { Router } from "express";

const router = Router();
const ADMIN_COOKIE = "sk_admin_session";
const SESSION_VALUE = "authenticated";

function verifyAdminAuth(req: any, res: any): boolean {
  const cookie = req.cookies?.[ADMIN_COOKIE];
  if (cookie !== SESSION_VALUE) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.post("/login", async (req, res): Promise<void> => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    res.cookie(ADMIN_COOKIE, SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, message: "Logged in" });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res): void => {
  res.clearCookie(ADMIN_COOKIE);
  res.json({ success: true, message: "Logged out" });
});

router.get("/check", (req, res): void => {
  if (verifyAdminAuth(req, res)) {
    res.json({ success: true, message: "Authenticated" });
  }
});

export { verifyAdminAuth };
export default router;
