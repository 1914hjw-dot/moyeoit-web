import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || '약속 날짜 조율하기';
    const type = searchParams.get('type') || '모여잇 • 5초 날짜 조율기';

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
            backgroundColor: '#09090b',
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
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#f4f4f5',
                color: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '20px',
              }}
            >
              📅
            </div>
            <span
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#f59e0b',
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
              maxWidth: '900px',
            }}
          >
            <span
              style={{
                fontSize: '52px',
                fontWeight: '900',
                color: '#f4f4f5',
                lineHeight: '1.2',
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </span>

            <span
              style={{
                fontSize: '24px',
                color: '#a1a1aa',
                fontWeight: '500',
              }}
            >
              로그인 0초! 단톡방 친구들과 10초 만에 가능 날짜를 투표해 주세요.
            </span>
          </div>

          {/* Footer Call to Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '30px',
              borderTop: '2px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '10px 20px',
                borderRadius: '999px',
                fontSize: '20px',
                fontWeight: '700',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              ⚡ 10초 만에 가능 일자 선택하기
            </div>

            <span
              style={{
                fontSize: '20px',
                color: '#71717a',
                fontWeight: '600',
              }}
            >
              moyeoit.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the OG image`, {
      status: 500,
    });
  }
}
