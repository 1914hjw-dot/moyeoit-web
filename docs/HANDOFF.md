# 모여잇 인수인계

최종 정리: 2026-09-04. 실제 배포 상태와 DB 마이그레이션 적용 상태는 별도로 확인해야 합니다.

## 프로젝트 목표

회원가입 없이 모임 후보일을 만들고 링크로 공유하며, 가능·미정·불가능 응답을 모아 방장이 날짜를 확정하는 서비스입니다. GitHub → Vercel 배포, Supabase PostgreSQL 저장소를 사용합니다.
이번 작업은 독립 도메인 변경 없이 AdSense 재심사 준비를 위한 콘텐츠와 광고 구조 개선입니다.

## 디렉터리 구조

```text
src/app/                 페이지, 메타데이터, 사이트맵, API
src/components/ads/      Kakao AdFit
src/components/ui/       입력·결과·공유 UI, 가이드 카드와 아이콘 경계
src/content/             가이드 목록과 상세 본문
src/lib/services/        서버 데이터 접근 및 권한 검사
src/lib/validation/      Zod 입력 검증
src/lib/security/        레이트리밋
supabase/migrations/     DB 스키마·권한 마이그레이션
public/ads.txt           Google 판매자 정보
scripts/                 로컬 프로덕션 콘텐츠 검사 실행기
tests/                   보안·콘텐츠 회귀 테스트
docs/                    인수인계
```

## 완료된 기능

- 날짜 후보 지정/자유 선택, 기간 지정 모드의 시간대 선택, 투표·집계·확정·공유.
- 공개 응답에서 방장 비밀값과 투표 소유권 토큰 제외, 소유권 기반 수정·삭제, salted PBKDF2 PIN 검증.
- 서버 service-role 접근, 입력 검증, Cron 인증, 분산 레이트리밋 코드 및 보안 마이그레이션 파일.
- 이번 변경: 투표방의 임시 AdSense 슬롯·사용하지 않는 광고 컴포넌트 제거.
- `ads.txt`를 Google 공식 형식 한 줄로 정리. Kakao AdFit은 홈 본문·FAQ 이후로 이동.
- 가이드 6개 보강: 상황별 판단 기준, 체크리스트, 가상 메시지 예시, 기능 제한과 수동 운영 설명.
- 가이드별 제목·설명·canonical·OG/Twitter·Article/BreadcrumbList JSON-LD, 작성일·수정일·관련 글.
- 목록/상세 본문 분리, 사이트맵과 정적 경로의 가이드 누락 방지.
- 근거 없는 시간 절감·참여율 문구 정리, 가상 예시 고지.
- 가이드 데이터 정합성 테스트와 로컬 프로덕션 HTML 통합 검사 추가.

## 진행 중 / 외부 확인 필요

- 이 변경 묶음은 커밋·푸시·Vercel 배포하지 않았습니다.
- AdSense 계정의 ads.txt 업데이트 확인·재심사 요청은 수행하지 않았습니다.
- 실제 Google 광고 스크립트와 유효한 광고 단위는 아직 연결하지 않았습니다. 계정 확인용 메타 태그만 유지합니다.
- 실제 서비스 캡처나 실제 사용자 사례는 추가하지 않았습니다. 현재 본문 예시는 모두 설명용입니다.
- 기존 보안 마이그레이션이 운영 Supabase에 적용됐는지 확인 필요. README의 코드 선배포 → SQL 실행 순서를 지켜야 합니다.

## 최종 검증 결과

- `npm run check`: 린트·타입·보안/콘텐츠 단위 검사·프로덕션 빌드 통과.
- 기본 테스트: 8개 통과, 로컬 서버가 필요한 통합 검사 1개는 기본 실행에서 의도적으로 제외.
- `npm run test:content`: 19개 검사 통과, 제외 없음. 실행기가 임시 서버를 직접 종료했습니다.
- 전체 가이드 초기 HTML 본문, 고유 메타데이터, canonical, JSON-LD, 사이트맵, 광고 제외 경로, 미등록 가이드 404를 확인했습니다.
- 앞선 작업에서 가이드 목록·상세 화면과 홈 광고의 FAQ 이후 배치를 브라우저로 확인했습니다. 이번 재개에서는 서버 경계 변경 후 HTTP 통합 검사를 재수행했습니다.
- 실제 운영 DB 쓰기나 AdSense 계정 변경은 하지 않았습니다.

## 버그 및 기술 부채

- lucide-react 패키지를 RSC에서 직접 평가하면 `createContext` 오류가 발생했습니다. 라이브러리 사용 부분을 클라이언트 경계로 감싸고 가이드 본문은 서버 렌더링합니다.
- `src/types/globals.d.ts`의 `declare module 'lucide-react'`로 인해 라이브러리 타입 검사가 약합니다. 공식 타입 제공 상태를 별도 점검할 필요가 있습니다.
- 이전 보안 점검에서 npm audit High 4건을 보고했습니다. 이번 콘텐츠 작업에서는 의존성을 변경하거나 취약점 상태를 재평가하지 않았습니다.
- 레이트리밋은 외부 저장소 오류 시 메모리 fallback이므로 다중 인스턴스 제한이 약해질 수 있습니다.
- 실제 브라우저 광고 노출은 광고 차단기·외부 서비스 상태에 영향받습니다. HTTP 검사만으로 광고 SDK 동작을 보장하지 않습니다.
- 개인정보/보관기간 안내는 Cron 실제 운영 및 백업 정책과 일치하는지 운영자가 확인해야 합니다.

## 중요한 설계 결정

- 공개 API DTO와 서버 권한 검증을 분리: 클라이언트 표시용 데이터에 자격 증명을 섞지 않습니다.
- 가이드 목록을 단일 소스로 유지: 제목·날짜·slug를 홈, 상세, 사이트맵에서 중복 관리하지 않습니다.
- 본문은 서버에, 아이콘은 작은 클라이언트 경계에 배치: 외부 라이브러리 호환성과 불필요한 본문 JS 전송을 분리합니다.
- JSON-LD는 native script와 `<` 이스케이프로 출력합니다.
- 날짜는 실제 편집 이력으로 관리: 빌드할 때마다 새 수정일을 만들지 않습니다.
- 광고 승인과 파일 정상 응답은 별개: 정책 검토나 승인을 코드가 대신할 수 없습니다.
- 사용자 요청에 따라 기존 Vercel 도메인을 유지합니다.

## 환경변수

실제 비밀값은 문서나 커밋에 넣지 않습니다. 키 목록은 `env.example`을 참조합니다.

- 필수: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`.
- 공개 연동: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_ADFIT_HOME`.
- 선택적 분산 제한: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- 통합 검사 전용: `CONTENT_TEST_BASE_URL`은 실행기가 임시 로컬 주소로 설정합니다. Vercel 설정 불필요.
- Cron: `vercel.json`의 `0 3 * * *` 스케줄로 `/api/cron/cleanup` 호출.

## 의존성

- Next.js 16.2.11, React/React DOM 19.2.4, TypeScript 5, Tailwind CSS 4.
- Supabase JS, Zod, lucide-react, Framer Motion, canvas-confetti, clsx, tailwind-merge.
- 검사: ESLint, TypeScript, Node 내장 test runner. 추가 패키지 설치 없음.
- 실제 설치 버전은 `package-lock.json` 기준이며 실행 환경은 README의 Node.js 요구사항을 따릅니다.

## 다음 작업 목록

1. `npm run check` 후 `npm run test:content`로 최종 빌드 검증.
2. 운영자의 작성 명의·본문·예시 검토, 필요 시 개인정보 없는 실제 데모 화면 캡처 보강.
3. 사용자 승인에 따라 변경을 커밋·푸시하고 Vercel 배포 확인.
4. 배포 주소의 `/ads.txt`, 모든 가이드, 사이트맵, 투표방 광고 제외를 재확인.
5. AdSense에서 ads.txt 업데이트 확인 후 콘텐츠가 반영된 상태에서 재심사 요청.
6. 승인 확인 후 유효한 광고 단위와 CSP·동의 요건을 검토해 콘텐츠 페이지에만 Google 광고 연결.
7. 보안 마이그레이션 및 Cron 운영 로그, 잔여 의존성 취약점 후속 점검.
