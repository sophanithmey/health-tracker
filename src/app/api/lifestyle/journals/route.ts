import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { LifestyleJournalSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const journals = await HealthRepository.getLifestyleJournals(PATIENT_ID);
    return NextResponse.json({ success: true, data: journals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = LifestyleJournalSchema.parse(body);

    const journal = await HealthRepository.saveLifestyleJournal({
      patientId: validated.patientId || PATIENT_ID,
      logDate: validated.logDate,
      waterGlasses: validated.waterGlasses,
      sleepHours: validated.sleepHours,
      symptoms: validated.symptoms,
      notes: validated.notes
    });

    return NextResponse.json({ success: true, data: journal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

