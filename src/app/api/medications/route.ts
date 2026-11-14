import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { MedicationSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const activePatient = await HealthRepository.getPatientProfile();
    const patientId = activePatient.id || PATIENT_ID;
    const meds = await HealthRepository.getMedications(patientId);
    return NextResponse.json({ success: true, data: meds });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin can manage medication catalog' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = MedicationSchema.parse(body);
    const activePatient = await HealthRepository.getPatientProfile();
    const patientId = validated.patientId || activePatient.id || PATIENT_ID;

    const saved = await HealthRepository.createMedication({
      patientId,
      name: validated.name,
      dosage: validated.dosage,
      frequency: validated.frequency,
      timingInstructions: validated.timingInstructions,
      prescribingDoctor: validated.prescribingDoctor,
      startDate: validated.startDate,
      endDate: validated.endDate,
      isActive: validated.isActive,
      notes: validated.notes,
      rxcui: body.rxcui || undefined,
      genericName: body.genericName || undefined,
      brandName: body.brandName || undefined,
      activeIngredients: Array.isArray(body.activeIngredients) ? body.activeIngredients : undefined,
      dosageForm: body.dosageForm || undefined,
      referenceSource: body.referenceSource || undefined
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

