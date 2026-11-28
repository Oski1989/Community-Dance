import { NextResponse } from 'next/server';
import { dbService } from '@/services/db.service';

export async function GET() {
  try {
    const [members, programs, sessions, quests, communityPosts, socialEvents] = await Promise.all([
      dbService.getMembers(),
      dbService.getPrograms(),
      dbService.getSessions(),
      dbService.getQuests(),
      dbService.getCommunityPosts(),
      dbService.getSocialEvents(),
    ]);

    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      members,
      programs,
      sessions,
      quests,
      communityPosts,
      socialEvents,
    };

    return NextResponse.json(backupData, {
      headers: {
        'Content-Disposition': `attachment; filename="backup_comuny_dance_${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error generating backup' }, { status: 500 });
  }
}
