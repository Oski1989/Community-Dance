import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { submitQuestProofSchema } from '@/schemas/community';
import { submitQuestProof } from '@/services/community.service';

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = submitQuestProofSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await submitQuestProof(userId, parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    console.error('[API /quests/submit POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
