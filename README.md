## 설치 및 실행 방법

### 사전 요구사항

#### 1. 개발 계정 준비
- **Microsoft 365 계정**: Teams를 사용할 수 있는 계정이 필요합니다
  - Microsoft 365 Developer Sandbox (정책 변경으로 무료 신청이 제한될 수 있음)
  - 또는 Microsoft 365 Business Basic 이상의 유료 구독
- **Azure 계정**: 앱 배포 및 리소스 관리를 위해 필요합니다

#### 2. 개발 도구 설치
- **Node.js** (권장 버전: LTS)
- **Visual Studio Code**
- **Microsoft 365 Agents Toolkit** (VS Code Extension)

### 환경 설정

#### 1. Microsoft 365 Agents Toolkit 설치 및 계정 연동
1. VS Code Extension Marketplace에서 "Microsoft 365 Agents Toolkit" 검색 후 설치
2. VS Code 왼쪽 메뉴에서 Toolkit 아이콘 클릭
3. **Accounts** 섹션에서 다음 계정들로 로그인:
   - **Microsoft 365 계정**: Teams 테스트를 위한 계정
   - **Azure 계정**: 앱 배포 및 리소스 관리용 계정

> **참고**: 두 계정 모두 정상적으로 연결되어야 Teams 앱 생성, 로컬 실행, 배포가 가능합니다.

#### 2. 프로젝트 클론 및 의존성 설치
```bash
# 프로젝트 클론
git clone https://github.com/dev-hamin-kim/Timmy2.git
cd Timmy2

# 의존성 설치
npm install
```

### 로컬 실행

#### 1. 개발 서버 실행
VS Code의 Microsoft 365 Agents Toolkit을 사용:
1. Toolkit 패널에서 **Local** 섹션 확인
2. **Preview Your Teams App (F5)** 버튼 클릭

#### 2. Teams에서 앱 테스트

##### 앱 패키지 준비
프로젝트를 빌드하면 `appPackage/build` 디렉토리에 `.zip` 파일이 생성됩니다.

##### Teams 미팅에서 앱 실행하기

1. **Teams 캘린더에서 테스트용 미팅 일정 생성**
   - Teams 앱을 열고 왼쪽 메뉴에서 **캘린더** 선택
   - **새 모임** 버튼을 클릭하여 테스트용 미팅 생성

2. **미팅 참가**
   - 생성한 미팅에 참가합니다

3. **앱 업로드**
   - 미팅 화면에서 **+ 앱** 버튼 클릭
   - 나타나는 플라이아웃 메뉴에서 **앱 관리** 선택
   - **앱 관리** 창에서 **사용자 지정 앱 업로드** 클릭
   
   > **사용자 지정 앱 업로드 옵션이 보이지 않나요?**  
   > 테넌트에서 사용자 지정 앱을 활성화해야 합니다. [자세한 지침은 여기를 참조하세요](https://docs.microsoft.com/ko-kr/microsoftteams/teams-custom-app-policies-and-settings)

4. **앱 패키지 선택**
   - 이전에 생성한 `.zip` 파일을 선택하여 업로드

5. **앱 추가**
   - 표시되는 대화 상자에서 **추가** 버튼을 클릭하여 미팅에 앱 추가
   - 이때, "문제 발생 - 탭을 저장할 수 없습니다. 다시 시도하세요." 경고 메시지가 나타날 수 있음, 그냥 진행해도 사용 가능

6. **앱 활성화**
   - 미팅 화면으로 돌아와서 다시 **+ 앱** 버튼 클릭
   - **앱 찾기** 텍스트 상자에 업로드한 앱 이름 입력
   - 앱을 선택하여 미팅에서 활성화

7. **앱 구성**
   - 구성 대화 상자가 나타나면 **저장** 버튼을 클릭하여 미팅에 앱 추가

8. **메인 스테이지로 공유**
   - 사이드 패널에서 **공유 아이콘**을 클릭하여 앱을 미팅의 메인 스테이지에 표시

9. **완료!**
   - 이제 미팅 스테이지에서 앱이 실행되는 것을 확인할 수 있습니다
   - 미팅에 초대된 다른 참가자들도 미팅에 참가하면 메인 스테이지에서 앱을 볼 수 있습니다

### 빌드 및 배포

#### Dev server 빌드

#### Azure에 배포
Microsoft 365 Agents Toolkit을 사용한 배포:
1. Toolkit 패널에서 **Lifecycle** 섹션 확인
2. **Provision** → **Deploy** 순서로 실행

> **주의사항**:
> - VSCode를 장시간 실행한 경우 인증 토큰이 만료되어 provisioning/deploying이 멈출 수 있습니다
> - 이 경우 VSCode를 재시작한 후 다시 시도하세요

### 문제 해결

#### 흔히 발생하는 문제

1. **"사용자 지정 앱 업로드" 옵션이 보이지 않음**
   - 테넌트 관리자에게 사용자 지정 앱 정책 활성화를 요청하세요
   - [Teams 사용자 지정 앱 정책 설정 가이드](https://docs.microsoft.com/ko-kr/microsoftteams/teams-custom-app-policies-and-settings)

2. **SDK 초기화 오류**
   - Teams SDK가 완전히 초기화된 후 Live Share 관련 기능을 호출하는지 확인하세요
   - `teamsJs.app.initialize()`가 완료된 후 `LiveShareHost.create()` 호출

3. **Provisioning/Deploying 멈춤**
   - VSCode를 재시작하세요

4. **로컬 테스트 시 앱이 로드되지 않음**
   - 개발 서버가 정상적으로 실행 중인지 확인
   - 브라우저 콘솔에서 CORS 또는 네트워크 오류 확인
   - Manifest 파일의 URL 설정이 올바른지 확인

더 자세한 문제 해결 방법은 프로젝트의 [개발 노트](timmy_troubleshooting.md) 문서를 참조하세요.

### 참고 문서
- [Microsoft Teams 공식 문서](https://learn.microsoft.com/ko-kr/microsoftteams/platform/)
- [Microsoft 365 Agents Toolkit 문서](https://learn.microsoft.com/ko-kr/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Live Share SDK 문서](https://learn.microsoft.com/ko-kr/microsoftteams/platform/apps-in-teams-meetings/teams-live-share-overview)