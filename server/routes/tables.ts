import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get tables for a restaurant
router.get('/:restaurantId', async (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  if (!Number.isFinite(restaurantId)) return res.status(400).json({ error: 'Invalid restaurantId' });
  const tables = await prisma.table.findMany({ where: { restaurantId }, orderBy: { number: 'asc' } });
  res.json(tables);
});

export default router;


