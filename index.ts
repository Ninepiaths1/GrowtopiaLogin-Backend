import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = 3000;

// trust proxy
app.set('trust proxy', 1);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// rate limiter
const limiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  console.log(`[REQ] ${req.method} ${req.path} | ${ip}`);
  next();
});

// root
app.get('/', (_req: Request, res: Response) => {
  res.send('GTPS BYPASS SERVER RUNNING');
});

/**
 * 🔥 DASHBOARD BYPASS
 * langsung redirect ke validate (skip HTML)
 */
app.all('/player/login/dashboard', async (_req: Request, res: Response) => {
  return res.redirect(307, '/player/growid/login/validate');
});

/**
 * 🔥 LOGIN VALIDATE BYPASS (AUTO SUCCESS)
 */
app.all('/player/growid/login/validate', async (req: Request, res: Response) => {
  try {
    const formData = req.body as Record<string, string>;

    const growId = formData?.growId || "";
    const password = formData?.password || "";
    const _token = formData?._token || "";

    const token = Buffer.from(
      `_token=${_token}&growId=${growId}&password=${password}`
    ).toString('base64');

    console.log(`[LOGIN] ${growId} -> BYPASS SUCCESS`);

    res.send(JSON.stringify({
      status: 'success',
      message: 'Login bypass success',
      token,
      url: '',
      accountType: 'growtopia',
    }));

  } catch (err) {
    console.log(`[ERROR LOGIN]: ${err}`);
    res.status(200).json({
      status: 'error',
      message: 'Login bypass failed',
    });
  }
});

/**
 * 🔥 CHECKTOKEN REDIRECT
 */
app.all('/player/growid/checktoken', async (_req: Request, res: Response) => {
  return res.redirect(307, '/player/growid/validate/checktoken');
});

/**
 * 🔥 CHECKTOKEN BYPASS (ALWAYS VALID)
 */
app.all('/player/growid/validate/checktoken', async (req: Request, res: Response) => {
  try {
    const formData = req.body as Record<string, string>;

    const refreshToken = formData?.refreshToken || "";
    const token = refreshToken || Buffer.from("bypass").toString("base64");

    console.log(`[CHECKTOKEN] BYPASS SUCCESS`);

    res.send(JSON.stringify({
      status: 'success',
      message: 'Bypassed',
      token,
      url: '',
      accountType: 'growtopia',
      accountAge: 999,
    }));

  } catch (err) {
    console.log(`[ERROR CHECKTOKEN]: ${err}`);
    res.status(200).json({
      status: 'error',
      message: 'Checktoken bypass failed',
    });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
});

export default app;
