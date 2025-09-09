# Football Club Frontend

Football Club 관리 시스템의 프론트엔드 애플리케이션입니다.

## 🚀 시작하기

### 환경 설정

1. `.env` 파일을 생성하고 필요한 환경변수를 설정하세요:
```bash
cp .env.example .env
```

2. `.env` 파일에서 카카오맵 API 키를 설정하세요:
```env
REACT_APP_KAKAO_MAP_KEY=your_kakao_map_api_key_here
```

### 카카오맵 API 키 발급 방법

1. [카카오 디벨로퍼](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. "내 애플리케이션" → "애플리케이션 추가하기"
4. 앱 이름, 사업자명 입력 후 저장
5. "앱 키" 탭에서 **JavaScript 키** 복사
6. "제품 설정" → "지도" → "Maps API" 활성화
7. "플랫폼" → "Web 플랫폼 등록"에서 도메인 추가:
   - `http://localhost:3000`
   - `http://kim.localhost:3000`
   - `http://admin.localhost:3000`
   - `http://*.localhost:3000`

## 🚀 배포 설정

### GitHub Secrets 설정

프로젝트를 배포하려면 GitHub 저장소에서 다음 Secrets을 설정해야 합니다:

1. **GitHub 저장소** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. **필수 Frontend Secrets**:
```
FRONTEND_ENV
- 값: .env 파일 전체 내용 (여러 줄로 입력)
  REACT_APP_KAKAO_MAP_KEY=e3b0ea4e382490c9af37c1d5ac40f2f5
  REACT_APP_API_URL=https://your-domain.com/api
```

3. **서버 배포용 Secrets** (기존):
```
CAFE24_HOST - 서버 호스트 주소
CAFE24_SSH_KEY - SSH 개인키
MYSQL_ROOT_PASSWORD - MySQL 루트 비밀번호
MYSQL_DATABASE - 데이터베이스 이름
MYSQL_USER - MySQL 사용자명
MYSQL_PASSWORD - MySQL 비밀번호
```

### 자동 배포

- **프론트엔드**: `fe/` 폴더 변경시 자동 배포
- **백엔드**: `be/` 폴더 변경시 자동 배포
- **수동 배포**: GitHub Actions → "Deploy Frontend to Cafe24" → "Run workflow"

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
