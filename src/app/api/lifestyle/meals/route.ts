import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { MealLogSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const meals = await HealthRepository.getMealLogs(PATIENT_ID);
    return NextResponse.json({ success: true, data: meals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = MealLogSchema.parse(body);

    const meal = await HealthRepository.createMealLog({
      patientId: validated.patientId || PATIENT_ID,
      mealType: validated.mealType,
      loggedAt: validated.loggedAt,
      foodDescription: validated.foodDescription,
      portionSize: validated.portionSize,
      carbEstimate: validated.carbEstimate,
      cambodianDishId: validated.cambodianDishId,
      notes: validated.notes
    });

    return NextResponse.json({ success: true, data: meal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

