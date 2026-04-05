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

// rate limit
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 100,
  })
);

// 🔥 GLOBAL BYPASS DASHBOARD (ANTI WEBVIEW)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.includes('/player/login/dashboard')) {
    return res.status(204).end(); // NO CONTENT → skip webview
  }
  next();
});

// logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';

  console.log(`[REQ] ${req.method} ${req.path} | ${ip}`);
  next();
});

// root
app.get('/', (_req, res) => {
  res.send('GTPS Auth Server Running');
});


// ==============================
// 🔐 LOGIN VALIDATE (AUTO LOGIN)
// ==============================
app.all('/player/growid/login/validate', async (req: Request, res: Response) => {
  try {
    const growId = req.body.growId || 'guest';
    const password = req.body.password || 'guest';

    // 🔥 generate fake token (auto login)
    const token = Buffer.from(
      `_token=auto&growId=${growId}&password=${password}&reg=0`
    ).toString('base64');

    return res.json({
      status: 'success',
      message: 'Login Success (Bypass)',
      token,
      url: '',
      accountType: 'growtopia',
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: 'error',
      message: 'Login failed',
    });
  }
});


// ==============================
// 🔁 CHECK TOKEN REDIRECT
// ==============================
app.all('/player/growid/checktoken', (_req: Request, res: Response) => {
  return res.redirect(307, '/player/growid/validate/checktoken');
});


// ==============================
// 🔁 VALIDATE CHECK TOKEN
// ==============================
app.all('/player/growid/validate/checktoken', async (req: Request, res: Response) => {
  try {
    let refreshToken = req.body.refreshToken;
    let clientData = req.body.clientData;

    if (!refreshToken || !clientData) {
      return res.json({
        status: 'error',
        message: 'Missing token',
      });
    }

    let decoded = Buffer.from(refreshToken, 'base64').toString();

    // remove reg flag
    decoded = decoded.replace('&reg=0', '').replace('&reg=1', '');

    // replace token with clientData
    const newToken = Buffer.from(
      decoded.replace(/(_token=)[^&]*/, `$1${Buffer.from(clientData).toString('base64')}`)
    ).toString('base64');

    return res.json({
      status: 'success',
      message: 'Token OK',
      token: newToken,
      url: '',
      accountType: 'growtopia',
      accountAge: 999,
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: 'error',
      message: 'Internal error',
    });
  }
});


// ==============================
// 🚀 START SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`[SERVER] RUNNING ON http://localhost:${PORT}`);
});
