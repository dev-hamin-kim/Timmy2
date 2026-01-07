# Timmy Development Troubleshooting

## 개발 노트

### Timmy 개발 과정에서 겪은 주요 이슈와 해결 방법

#### 1. Microsoft 365 Developer Sandbox 접근 제한
**문제:**
- Microsoft 정책 변경으로 인해 무료 Developer Sandbox 신청이 불가능해짐
- 메일 응답을 기다리기 보다는 빠르게 개발 환경을 구축해야 하는 상황

**해결 방법:**
- Microsoft 365 Business Basic을 직접 구매하여 테스트 환경 구축
- 비용이 발생하지만 크지 않았으며, 즉시 개발을 시작할 수 있었음

**교훈:**
- 무료 정책은 수시로 변경될 수 있으므로 주의할 것
- 대안책을 빠르게 찾는 것이 중요함

---

#### 2. App Manifest 설정의 어려움
**문제:**
- 미팅 사이드바에서 앱을 사용할 수 있게 하려면 App Manifest에 `context` property를 설정해야 하는데, 문서에서 해당 설정 위치를 찾기 어려움
- 공식 문서의 설명이 불충분하여 실제 구현 방법을 파악하기 힘들었음

**해결 방법:**
1. [Manifest Schema Reference](https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/?view=m365-app-1.24) 문서를 직접 탐색
2. [JSON Schema 파일](https://developer.microsoft.com/json-schemas/teams/v1.24/MicrosoftTeams.schema.json)을 찾아서 분석
3. `context` 내부의 `meetingStage` 값 위치를 확인하고 manifest에 적용

**참고 코드:**
```json
{
  "configurableTabs": [
    {
      "context": ["meetingStage", "meetingSidePanel"]
    }
  ]
}
```

**교훈:**
- Teams 개발 시 공식 문서만으로는 부족할 수 있으며, Schema 파일을 직접 확인하는 것이 효과적임
- 또는 예제 앱들의 Manifest.json을 참고하는 것도 좋은 방법임

---

#### 3. Live Share SDK 초기화 순서 오류
**문제:**
- `LiveShareHost.create()`를 호출했으나 앱이 응답하지 않고 먹통이 됨

**원인:**
- Teams Client SDK가 초기화되지 않은 상태에서 LiveShareHost를 호출함
- SDK 간의 초기화 순서가 중요한데 이를 간과함

**해결 방법:**
```javascript
useEffect(() => {
   // 1. Teams SDK 먼저 초기화
  app.initialize().then(async () => {
    // 2. 초기화 완료 후 LiveShareHost 생성
    const host = LiveShareHost.create();
    // ... 이후 로직
  });
}, []);
```

**참고 문서:**
- [Teams Live Share Capabilities - Join a Session](https://learn.microsoft.com/en-us/microsoftteams/platform/apps-in-teams-meetings/teams-live-share-capabilities?tabs=react#join-a-session)

**교훈:**
- React 컴포넌트 생명주기와 비동기 SDK 초기화 순서를 명확히 이해해야 함
- useEffect 내에서 함수를 순서를 적절히 사용하여 초기화 순서를 보장해야 함

---

#### 4. CSS 스타일링 이슈 (미해결)
**문제:**
- `App.css`에 `.className` 형태로 스타일을 정의하고 컴포넌트의 `className`으로 적용하려 했으나 스타일이 적용되지 않음
- 원인을 정확히 파악하지 못한 상태

**임시 해결 방법:**
- 인라인 `style` 속성을 사용하여 스타일 적용
```javascript
<div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
  {/* content */}
</div>
```

**제약 사항:**
- 시간 제약으로 인해 근본 원인을 파악하지 못하고 workaround로 진행

**개선 방향:**
- CSS 모듈 시스템이나 CSS-in-JS 라이브러리 도입 검토 필요
- Teams 앱의 빌드 설정과 스타일 로딩 순서 확인 필요

---

#### 5. LiveCursor 구현의 문서 부족
**문제:**
- 화이트보드에서 다른 사용자의 커서 위치를 실시간으로 표시하고 싶었으나 관련 문서가 거의 없음
- LLM(GPT)이 제공한 정보도 부정확하여 혼란을 가중시킴

**해결 방법:**
- Live Share SDK의 소스 코드를 직접 분석
- GitHub 저장소에서 관련 예제 코드를 찾아서 참고
- 실험과 테스트를 통해 동작 방식을 이해함

**교훈:**
- 문서화가 부족한 기능의 경우 소스 코드 분석이 가장 확실한 방법임
- LLM이 제공하는 정보는 항상 검증이 필요하며, 공식 문서나 소스 코드를 우선시해야 함

---

#### 6. 존재하지 않는 API 함수 문제
**문제:**
- LLM이 `meeting.getParticipant()` 함수 사용을 추천했으나 해당 함수는 실제로 존재하지 않음
- 잘못된 정보로 인해 시간 낭비 발생

**올바른 해결 방법:**
```javascript
// 잘못된 방법 (존재하지 않음)
// meeting.getParticipant()

// 올바른 방법
app.getContext().then((context: app.Context) => {
  const userId = context.user?.id;
  // userId 사용
});
```

**참고 문서:**
- [Teams JS SDK - app.getContext()](https://learn.microsoft.com/en-us/javascript/api/@microsoft/teams-js/app?view=msteams-client-js-latest)

**교훈:**
- LLM의 코드 제안은 항상 검증해야 함

---

#### 7. Adaptive Cards를 통한 투표 기능 구현 시도
**문제:**
- 실시간 투표 기능을 [Adaptive Cards](https://adaptivecards.microsoft.com/?topic=welcome)의 차트 기능을 활용하여 구현하려 시도
- [Adaptive Cards Designer](https://adaptivecards.microsoft.com/designer.html)를 활용하여 추후 사용자가 직접 UI를 변경하게 하는 것은 어떤가 하는 생각에서 시도하였음
- 구현은 성공했으나 코드가 매우 복잡하고 유지보수가 어려웠음

**해결 방법:**
- Adaptive Cards 구현을 제거하고 더 간단한 방식으로 재구현
- Fluent UI 컴포넌트를 조합하여 더 깔끔한 코드 작성

**교훈:**
- 기술 스택을 선택할 때는 구현 가능성과 아이디어 뿐만 아니라 유지보수성도 고려해야 함
- 과도하게 복잡한 구현보다는 단순하고 명확한 구현이 더 나을 수 있음

---

#### 8. SidePanel에서 HomePage 구현의 제약
**문제:**
- SidePanel이 처음 시작될 때 HomePage를 표시하고, 공유 버튼을 누르면 LiveCanvas 페이지로 전환하고 싶었음
- Meeting Stage로 공유하는 것 자체는 가능했으나, 공유 상태로 전환 시 SidePanel을 닫을 수 없었음.

**원인:**
- 공유 상태를 감지하는 API는 존재하나(meeting.getAppContentStageSharingState), SidePanel을 닫는 API는 존재하지 않았음

**해결 방법:**
- HomePage 개념을 포기하고 처음부터 협업 기능을 표시하는 구조로 설계 변경
- 사용자 경험을 단순화하여 추가 네비게이션 없이 바로 기능에 접근하도록 함

**교훈:**
- Teams Meeting App은 일반 웹 앱과 달리 플랫폼 제약이 많음
- API 제한 사항을 초기에 파악하여 기획 단계에서 고려해야 함

---

#### 9. Microsoft 365 Agents Toolkit 사용 시 주의사항
**문제:**
- VSCode를 장시간 실행한 상태에서 provisioning이나 deploying 작업이 멈춤
- 재시도해도 계속 같은 현상 발생

**원인:**
- 인증 토큰이나 액세스 토큰이 만료되었으나 자동 갱신되지 않음 (추정)

**해결 방법:**
- VSCode를 재시작하면 정상 작동
- 장시간 작업 시 주기적으로 VSCode 재시작

**교훈:**
- Toolkit의 인증 관리에 제한이 있음을 인지하고 작업해야 함
- 장시간 개발 시 중간중간 IDE 재시작을 습관화할 필요가 있음

---

### Microsoft Teams 환경 특성으로 인해 고려해야 했던 제약 사항

#### 1. 플랫폼 제약 사항
- **제한된 API 접근**: 일부 기능은 Microsoft 내부 전용으로 표시되어 있어 외부 개발자가 사용할 수 없음
- **Manifest 기반 권한 관리**: 모든 기능은 Manifest 파일에 명시적으로 선언되어야 함
- **SDK 초기화 순서**: Teams SDK와 Live Share SDK 등 여러 SDK를 사용할 때 초기화 순서가 중요하며, 이를 지키지 않으면 예기치 않은 오류가 발생함

#### 2. 개발 환경 제약
- **Developer Sandbox 정책 변경**: 무료 개발 환경이 제한되어 유료 구독이 필요할 수 있음
- **인증 토큰 관리**: 개발 툴킷의 인증 토큰 갱신이 자동으로 이루어지지 않아 (추정) 주기적인 재시작이 필요함
- **로컬 개발의 한계**: Meeting 환경의 일부 기능은 로컬에서 완전히 테스트하기 어려워 Azure를 활용한 Dev 환경에서 테스트가 필요함

#### 3. 문서화 및 지원
- **불완전한 공식 문서**: 일부 기능의 경우 문서의 설명이 부족하거나 업데이트되지 않음
- **LLM의 부정확한 정보**: ChatGPT, GitHub Copilot 등이 제공하는 정보가 최신이 아니거나 잘못된 경우가 많음
- **예제 코드 부족**: 복잡한 기능 조합에 대한 실무적인 예제가 부족함
---

### 이번 과제를 통해 배운 점

#### 기술적 학습
1. **Microsoft Teams Meeting App 생태계 이해**
   - Teams 플랫폼의 구조와 제약 사항을 실전에서 경험
   - Manifest 기반의 권한 관리 시스템에 대한 이해

2. **Live Share SDK 활용**
   - 실시간 협업 기능 구현을 위한 Live Share SDK 사용법
   - LiveState, LiveCanvas 등의 개념과 Rx 패턴의 연관성 이해
   - 여러 SDK를 함께 사용할 때의 초기화 순서 중요성

3. **문제 해결 능력 향상**
   - 문서가 부족한 상황에서 소스 코드를 직접 분석하는 방법
   - Manifest Schema 파일을 통해 설정 옵션을 찾아내는 방법

#### 개발 프로세스 학습
1. **공식 문서의 한계 인식**
   - LLM이나 오래된 문서를 무조건 신뢰하면 안 됨
   - 최신 공식 문서와 소스 코드를 우선시해야 함

2. **시간 제약 내 우선순위 설정**
   - 완벽한 구현보다는 핵심 기능 완성을 우선
   - 미해결 이슈를 문서화하고 workaround로 진행

3. **플랫폼 특성 이해의 중요성**
   - 일반 웹 개발과 플랫폼 앱 개발의 차이
   - 플랫폼 제약 사항을 초기 기획 단계에서 고려해야 함

---

### 추가로 개선하고 싶은 점

#### 기술적 개선
1. **CSS 스타일링 시스템 정립**
   - 현재 인라인 스타일로 임시 처리한 부분을 체계화
   - Fluent UI 테마 시스템과의 통합 개선

2. **에러 처리 및 로깅 체계**
   - 사용자 친화적인 에러 메시지 표시
   - 개발자를 위한 상세한 로깅 시스템 구축

3. **테스트 코드 작성**
   - 핵심 기능에 대한 단위 테스트
   - 통합 테스트 환경 구축

#### 기능적 개선

1. **접근성 개선**
   - 실시간 화이트보드 다크 모드 최적화
   - 키보드 네비게이션 최적화

2. **데이터 영속성**
   - 회의 종료 후 데이터 저장 및 불러오기 기능
   - 이전 회의 내용 참조 기능

---

### 결론

이번 Teams Meeting App 개발 과제를 통해 Microsoft Teams 플랫폼의 특성과 제약 사항을 깊이 이해할 수 있었습니다. 특히 문서가 불완전하거나 LLM의 정보가 부정확한 상황에서도 소스 코드 분석과 실험을 통해 문제를 해결하는 능력을 키울 수 있었습니다.

시간 제약이 있었지만 핵심 요구사항인 실시간 화이트보드, 투표 기능, 협업 캘린더를 모두 구현할 수 있었으며, 이 과정에서 얻은 경험과 노하우는 향후 큰 도움이 될 것입니다.

Teams 플랫폼 개발은 일반 웹 개발과는 다른 접근이 필요하며, 플랫폼의 제약 사항을 이해하는 것이 중요하다는 것을 배웠습니다.