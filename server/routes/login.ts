import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  const { username, email, password } = req.body ?? {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  // Mock auth success
  return res.json({
    user: { username, email },
    token: 'mock-token',
  });
});

export default router;



