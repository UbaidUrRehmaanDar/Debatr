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

  // Only seed invitation code if SEED_INVITATION_CODE is provided
  const invitationCode = process.env.SEED_INVITATION_CODE
  if (invitationCode && adminEmail) {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (admin) {
      const expiresAt = new Date()
      const expiresInDays = parseInt(process.env.SEED_INVITATION_EXPIRES_DAYS || '30', 10)
      expiresAt.setDate(expiresAt.getDate() + expiresInDays)

      const invitation = await prisma.invitation.upsert({
        where: { code: invitationCode },
        update: {},
        create: {
          code: invitationCode,
          email: process.env.SEED_INVITATION_EMAIL || '',
          createdById: admin.id,
          expiresAt,
        },
      })
      console.log('✅ Created invitation code:', invitation.code)
    }
  } else {
    console.log('⏭️  Skipping invitation code creation (SEED_INVITATION_CODE not set)')
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
