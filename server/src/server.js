import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import createError from 'http-errors';
import pokemonRouter from './routes/pokemon.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/pokemon', pokemonRouter);

app.use((_req, _res, next) => {
  next(createError(404, 'Not found'));
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Something went wrong',
      status,
    },
  });
});

app.listen(PORT, () => {
  console.log(`API ready on http://localhost:${PORT}`);
});
