import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const limiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// root
app.get('/', (_req: Request, res: Response) => {
  res.send('GTPS DASHBOARD SKIPPER RUNNING');
});

/**
 * 🔥 DASHBOARD BYPASS
 * Langsung lempar ke validate tanpa nunggu input di HTML
 */
app.all('/player/login/dashboard', async (_req: Request, res: Response) => {
  return res.redirect(307, '/player/growid/login/validate');
});

/**
 * 🔥 LOGIN VALIDATE BYPASS (PURE SKIP)
 * Tidak mengirim growId/password agar game kembali ke state awal/dialog
 */
app.all('/player/growid/login/validate', async (_req: Request, res: Response) => {
  try {
    console.log(`[DASHBOARD] Skip Triggered`);

    res.send(JSON.stringify({
      status: 'success',
      message: 'Dashboard skipped',
      token: "", // KOSONGKAN TOKEN agar tidak menimpa data login manual
      url: '',
      accountType: 'growtopia',
    }));

  } catch (err) {
    res.status(200).json({ status: 'error', message: 'failed' });
  }
});

/**
 * 🔥 CHECKTOKEN BYPASS
 */
app.all('/player/growid/checktoken', async (_req: Request, res: Response) => {
  return res.redirect(307, '/player/growid/validate/checktoken');
});

app.all('/player/growid/validate/checktoken', async (_req: Request, res: Response) => {
  try {
    res.send(JSON.stringify({
      status: 'success',
      message: 'Bypassed',
      token: "", // KOSONGKAN JUGA DISINI
      url: '',
      accountType: 'growtopia',
      accountAge: 999,
    }));
  } catch (err) {
    res.status(200).json({ status: 'error', message: 'failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[SERVER] Skipper running on port ${PORT}`);
});

export default app;
