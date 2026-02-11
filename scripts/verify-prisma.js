const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Prisma Client Model Property Names:");
    // We can't easily inspect types at runtime, but we can try to create a record and see if it fails, 
    // or checks dmmf if available.
    // Better: print the dmmf
    const dmmf = await prisma._getDmmf();
    const model = dmmf.datamodel.models.find(m => m.name === 'ExchangePoint');
    if (model) {
        console.log("Found ExchangePoint model:");
        model.fields.forEach(f => console.log(` - ${f.name} (${f.type})`));
    } else {
        console.log("ExchangePoint model NOT found in DMMF.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
