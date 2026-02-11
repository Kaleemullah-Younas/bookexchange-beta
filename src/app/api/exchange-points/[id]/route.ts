import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const point = await prisma.exchangePoint.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true
                    }
                }
            }
        });

        if (!point) {
            return NextResponse.json({ success: false, error: "Point not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: point });
    } catch (error) {
        console.error("Failed to fetch point:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch point" }, { status: 500 });
    }
}
