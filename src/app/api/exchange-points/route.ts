import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const points = await prisma.exchangePoint.findMany({
            where: {
                status: 'ACTIVE'
            },
            include: {
                owner: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });
        return NextResponse.json({ success: true, data: points });
    } catch (error) {
        console.error("Failed to fetch points:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch points" }, { status: 500 });
    }
}
