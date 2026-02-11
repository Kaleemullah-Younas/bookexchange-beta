const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to create Exchange Point...");

    // Create a dummy user first to be the owner
    const user = await prisma.user.create({
        data: {
            id: `user_${Date.now()}`,
            name: "Test Owner",
            email: `testowner_${Date.now()}@example.com`,
            emailVerified: true
        }
    });
    console.log("Created dummy user:", user.id);

    const point = await prisma.exchangePoint.create({
        data: {
            name: "Test Stall",
            description: "A test stall created by script",
            location: "123 Test Lane",
            latitude: 51.5,
            longitude: -0.09,
            contactMethod: "EMAIL",
            contactValue: "test@example.com",
            ownerId: user.id
        },
    });

    console.log("Successfully created Exchange Point:", point);
    console.log("Cleaning up...");
    await prisma.exchangePoint.delete({ where: { id: point.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Cleanup done.");
}

main()
    .catch(e => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
