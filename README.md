
# Updated-Dino-Reserve-Web-Aoo

  # Dino Reserve Web App

  This is a code bundle for Dino Reserve Web App. The original project is available at https://www.figma.com/design/Ip5OrsdBoGJkBzuLCpHyMY/Dino-Reserve-Web-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Full-stack setup

  1. Create a `.env` in the project root with:
  
  ```
  DATABASE_URL="file:./server/prisma/dev.db"
  PORT=4000
  ```
  
  2. Install backend dependencies:
     - `npm i express cors morgan dotenv @prisma/client`
     - `npm i -D prisma ts-node typescript`
  3. Generate Prisma client: `npx prisma generate`
  4. Run initial migration: `npx prisma migrate dev --name init`
  5. Seed data: `npx ts-node server/prisma/seed.ts`
  6. Start backend: `npm run server`
  7. Start frontend: `npm run dev`
  

