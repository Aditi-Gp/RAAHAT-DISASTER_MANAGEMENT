const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: "admin@test.com" },
          { role: "ADMIN" }
        ]
      }
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.email);
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: hashedPassword,
        fullName: "Admin User",
        phone: "+1234567890",
        role: "ADMIN",
        isVerified: true,
        isAvailable: true,
        location: [77.2090, 28.6139], // Delhi coordinates
      }
    });

    console.log("✅ Admin user created successfully:", admin.email);
    return admin;

  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
