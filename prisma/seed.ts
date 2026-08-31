import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// Load environment variables
config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL
const adapter = connectionString ? new PrismaPg({ connectionString }) : undefined

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
})

async function main() {
  console.log('🌱 Starting seed...')

  // Only seed if SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are provided
  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        passwordHash: hashedPassword,
        role: 'admin',
        emailVerified: new Date(),
      },
    })
    console.log('✅ Created admin user:', admin.email)
  } else {
    console.log('⏭️  Skipping admin user creation (SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD not set)')
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
