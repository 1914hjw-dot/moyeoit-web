import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || '모여잇 - 5초 날짜 조율기';
    const topDate = searchParams.get('topDate') || '전원 참석 가능한 날짜 조율 중';
    const voterCount = searchParams.get('voters') || '0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '60px',
            backgroundColor: '#0f0d15',
            backgroundImage:
              'radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.4), transparent 40%), radial-gradient(circle at 90% 90%, rgba(245, 158, 11, 0.3), transparent 40%)',
            fontFamily: 'sans-serif',
            color: 'white',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              📅
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #a78bfa, #f472b6, #fbbf24)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              모여잇 Moyeoit
            </span>
          </div>

          {/* Title and Top status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                padding: '6px 16px',
                borderRadius: '999px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              ⚡ 로그인 0초 • 10초 날짜 투표
            </div>

            <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.2 }}>
              {title}
            </div>

            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              🏆 {topDate} (현재 {voterCount}명 투표 완료)
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)',
              paddingTop: '20px',
              fontSize: '18px',
              color: '#a78bfa',
            }}
          >
            <span>터치하여 가능 날짜 투표하기 →</span>
            <span>moyeoit.vercel.app</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
