import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.post('/', async (req, res) => {
  const { tableId, name, phone, partySize, time } = req.body ?? {};
  if (!tableId || !name || !phone || !partySize || !time) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const reservation = await prisma.reservation.create({
      data: {
        tableId: Number(tableId),
        name,
        phone,
        partySize: Number(partySize),
        time: new Date(time),
      },
    });
    // mark table reserved
    await prisma.table.update({ where: { id: Number(tableId) }, data: { isReserved: true } });
    return res.json(reservation);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create reservation' });
  }
});

export default router;


