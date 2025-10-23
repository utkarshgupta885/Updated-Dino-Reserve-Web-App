import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DINO_ICONS = ['trex', 'stego', 'trike', 'brachio', 'raptor'];

async function main() {
  // Seed 5 restaurants and 25 tables each
  for (let i = 0; i < 5; i++) {
    const restaurant = await prisma.restaurant.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        name: `Dino Diner #${i + 1}`,
        dinoIcon: DINO_ICONS[i % DINO_ICONS.length],
      },
    });

    const existingTables = await prisma.table.count({ where: { restaurantId: restaurant.id } });
    if (existingTables < 25) {
      const toCreate = Array.from({ length: 25 }, (_, idx) => ({
        number: idx + 1,
        restaurantId: restaurant.id,
      }));
      await prisma.table.createMany({ data: toCreate });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });



