import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || '약속 날짜 조율하기';
    const type = searchParams.get('type') || '모여잇 • 5초 약속 날짜 조율기';

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
            backgroundColor: '#fafafc',
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '22px',
              }}
            >
              📅
            </div>
            <span
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              {type}
            </span>
          </div>

          {/* Body Room Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '960px',
              backgroundColor: '#ffffff',
              padding: '40px',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                fontWeight: '900',
                color: '#0f172a',
                lineHeight: '1.25',
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </span>

            <span
              style={{
                fontSize: '22px',
                color: '#64748b',
                fontWeight: '600',
              }}
            >
              회원가입 0초! 단톡방 친구들과 가능 날짜를 한눈에 투표해보세요.
            </span>
          </div>

          {/* Footer Call to Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                padding: '10px 20px',
                borderRadius: '999px',
                fontSize: '18px',
                fontWeight: '800',
                border: '1px solid #a7f3d0',
              }}
            >
              ✓ 10초 만에 모임 약속 날짜 찾기
            </div>

            <span
              style={{
                fontSize: '20px',
                color: '#94a3b8',
                fontWeight: '700',
              }}
            >
              moyeoit-web.vercel.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate the OG image', {
      status: 500,
    });
  }
}
