# 모여잇 (Moyeoit)

회원가입 없이 모임 후보 날짜를 만들고 공유·투표·확정하는 Next.js 16 서비스입니다. Vercel에서 배포하고 Supabase PostgreSQL을 데이터 저장소로 사용합니다.

## 로컬 실행

Node.js 22 이상을 권장합니다.

```bash
npm ci
copy env.example .env.local
npm run dev
```

배포 전 전체 검사는 다음 명령으로 실행합니다.

```bash
npm run check
```

## 필수 환경변수

키 목록은 `env.example`을 참고합니다. 운영 환경에서는 다음 값이 반드시 필요합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — 서버에서만 사용하며 `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다.
- `CRON_SECRET` — Vercel Cron이 보내는 Bearer 토큰과 일치해야 합니다.
- `NEXT_PUBLIC_SITE_URL`

`NEXT_PUBLIC_SUPABASE_ANON_KEY`는 현재 애플리케이션 코드에서 사용하지 않습니다. 브라우저는 Supabase 기본 테이블에 직접 접근하지 않고 모든 요청을 Next.js API로 보냅니다.

## 2026-09-03 보안 배포 순서

운영 중인 기존 방장 비밀값을 무중단으로 해시 전환하기 위해 순서를 지켜야 합니다.

1. Vercel Production 환경에 `SUPABASE_SERVICE_ROLE_KEY`와 충분히 긴 무작위 `CRON_SECRET`을 설정합니다.
2. 이 애플리케이션 코드를 Vercel에 먼저 배포합니다. 새 코드는 기존 원문 비밀값과 `sha256:` 해시를 모두 검증할 수 있습니다.
3. 배포 직후 Supabase에서 `supabase/migrations/20260903_production_security_hardening.sql`을 실행합니다.
4. 방 생성, 투표 생성·수정·삭제, 방장 날짜 확정, 시연 모임방을 스모크 테스트합니다.
5. Vercel Cron 실행 로그에서 `/api/cron/cleanup`이 200을 반환하는지 확인합니다.

마이그레이션은 다음 작업을 수행합니다.

- 기존 방장 비밀값을 SHA-256 capability digest로 변환
- anon/authenticated의 `rooms`, `votes`, `audit_logs` 직접 접근 제거
- 다중 Vercel 인스턴스에서 공유하는 DB 레이트리밋 함수 추가
- 정리 RPC와 레이트리밋 RPC 실행 권한을 `service_role`로 제한

PIN 없이 작성된 기존 투표는 과거 클라이언트가 소유권 토큰을 저장하지 않았기 때문에 안전하게 소유자를 복구할 수 없습니다. 해당 사용자는 새 닉네임으로 다시 투표해야 합니다. 새 투표부터는 브라우저에 소유권 토큰을 저장하며 공개 API 응답에는 토큰이 포함되지 않습니다.

## 주요 디렉터리

- `src/app` — App Router 페이지 및 Route Handler
- `src/lib/services` — 서버 전용 데이터 접근·권한 검증 계층
- `src/lib/validation` — Zod 입력 검증
- `src/lib/security` — 분산 레이트리밋
- `supabase/migrations` — 운영 DB 마이그레이션
- `tests` — 보안 회귀 테스트

## 가이드와 광고 유지보수

- `src/content/guide-catalog.ts` — 가이드 제목·요약·작성일의 단일 목록. 홈 카드와 사이트맵이 사용합니다.
- `src/content/guides.ts` — 목록을 참조하는 상세 본문과 관련 글 연결.
- 가이드 목록·본문은 서버 컴포넌트로 렌더링하고, 아이콘 라이브러리는 클라이언트 경계로 분리합니다.
- 글을 고칠 때 실제 수정일을 갱신합니다. 예시 인원·금액은 실제 이용 사례처럼 표시하지 않습니다.
- Google AdSense는 계정 확인용 메타 태그와 `ads.txt`만 유지합니다. 투표방의 임시 광고 슬롯은 제거했습니다.
- Kakao AdFit은 홈의 서비스 설명·가이드·FAQ 뒤에만 배치합니다.
- 실제 Google 광고 스크립트·슬롯 추가는 승인 확인 후 별도 작업입니다. 빈 화면·투표방·오류·약관·문의 화면에는 광고를 삽입하지 않습니다.

빌드 결과의 모든 가이드 HTML, 메타데이터, JSON-LD, 사이트맵, 광고 제외 경로를 확인하려면:

```bash
npm run check
npm run test:content
```

`test:content`는 기존 빌드를 임시 로컬 포트에 띄우고 검사 후 해당 서버만 종료합니다.
AdSense 업데이트 확인과 재심사는 실제 배포 후 계정 소유자가 수행해야 합니다. 이 코드 변경만으로 승인이 보장되지는 않습니다.

프로젝트 상태와 이어서 할 작업은 [인수인계 문서](docs/HANDOFF.md)를 참고하세요.
