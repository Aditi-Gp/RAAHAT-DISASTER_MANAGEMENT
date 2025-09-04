const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Hash a default password
  const hashedPassword = await bcrypt.hash("password123", 12);

  try {
    // Create sample users
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@raahat.com" },
      update: {},
      create: {
        email: "admin@raahat.com",
        password: hashedPassword,
        fullName: "System Administrator",
        phone: "+1234567890",
        role: "SUPER_ADMIN",
        isVerified: true,
      },
    });

    const volunteerUser = await prisma.user.upsert({
      where: { email: "volunteer@raahat.com" },
      update: {},
      create: {
        email: "volunteer@raahat.com",
        password: hashedPassword,
        fullName: "John Volunteer",
        phone: "+1234567891",
        role: "VOLUNTEER",
        isVerified: true,
        isAvailable: true,
      },
    });

    const regularUser = await prisma.user.upsert({
      where: { email: "user@raahat.com" },
      update: {},
      create: {
        email: "user@raahat.com",
        password: hashedPassword,
        fullName: "Jane User",
        phone: "+1234567892",
        role: "USER",
        isVerified: true,
      },
    });

    console.log("✅ Sample users created:", {
      admin: adminUser.email,
      volunteer: volunteerUser.email,
      user: regularUser.email,
    });

    // Note: For geospatial data seeding, you would typically use raw SQL
    // Example for creating SOS with location:
    /*
    await prisma.$executeRaw`
      INSERT INTO sos_requests (text, location, status, category, urgency, "createdById", "createdAt", "updatedAt")
      VALUES (
        'Emergency rescue needed at Central Park',
        ST_GeomFromText('POINT(-73.965355 40.782865)', 4326),
        'NEW',
        'Needs Rescue',
        'High',
        ${regularUser.id},
        NOW(),
        NOW()
      )
    `;
    */

    console.log("🌱 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
