'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schema for input validation
const createExchangePointSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    location: z.string().min(5, "Address is required"),
    latitude: z.number(),
    longitude: z.number(),
    contactMethod: z.enum(["EMAIL", "PHONE", "CHAT"]),
    contactValue: z.string().min(1, "Contact details are required"),
});

export async function createExchangePoint(prevState: any, formData: FormData) {
    try {
        const rawData = {
            name: formData.get("name"),
            description: formData.get("description"),
            location: formData.get("location"),
            latitude: parseFloat(formData.get("latitude") as string),
            longitude: parseFloat(formData.get("longitude") as string),
            contactMethod: formData.get("contactMethod"),
            contactValue: formData.get("contactValue"),
            ownerId: formData.get("ownerId"),
        }

        const validateOwner = z.string().min(1);
        if (!validateOwner.safeParse(rawData.ownerId).success) {
            return { message: "Unauthorized", success: false };
        }

        const validatedFields = createExchangePointSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return {
                success: false,
                errors: validatedFields.error.flatten().fieldErrors,
                message: "Missing Fields. Failed to Create Exchange Point.",
            };
        }

        const { name, description, location, latitude, longitude, contactMethod, contactValue } = validatedFields.data;

        await prisma.exchangePoint.create({
            data: {
                name,
                description,
                location,
                latitude,
                longitude,
                contactMethod,
                contactValue,
                ownerId: rawData.ownerId as string,
            },
        });

        revalidatePath("/exchange-points");
        return { success: true, message: "Exchange point created successfully!", errors: undefined };
    } catch (error) {
        console.error("Database Error:", error);
        return { message: "Database Error: Failed to Create Exchange Point.", success: false, errors: undefined };
    }
}

export async function getExchangePoints() {
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
        return { success: true, data: points };
    } catch (error) {
        console.error("Failed to fetch points:", error);
        return { success: false, error: "Failed to fetch points" };
    }
}

export async function getExchangePointById(id: string) {
    try {
        const point = await prisma.exchangePoint.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        name: true,
                        image: true,
                        email: true // needed for contact if method is EMAIL
                    }
                }
            }
        });
        if (!point) return { success: false, error: "Point not found" };
        return { success: true, data: point };
    } catch (error) {
        console.error("Failed to fetch point:", error);
        return { success: false, error: "Failed to fetch point" };
    }
}
