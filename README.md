# TaskFlow 프론트엔드 연동 가이드

<div align="center">
  <h3>Spring Boot 백엔드 개발자를 위한 프론트엔드 연동 가이드</h3>
  <p><strong>프론트엔드 코드 수정 없이 백엔드 연동하기</strong></p>
</div>

## 목차
- [프로젝트 개요](#프로젝트-개요)
- [프론트엔드 실행 방법](#프론트엔드-실행-방법)
- [Docker로 실행하기](#docker로-실행하기)
- [백엔드 요구사항](#백엔드-요구사항)
- [API 명세](#api-명세)
- [데이터 모델](#데이터-모델)
- [인증과 인가](#인증과-인가)
- [CORS 설정](#cors-설정)
- [자주 발생하는 문제](#자주-발생하는-문제)
- [테스트 체크리스트](#테스트-체크리스트)
- [도움말](#도움말)

## 프로젝트 개요

TaskFlow는 React로 구현된 할 일 관리 웹 애플리케이션입니다. 이 가이드는 프론트엔드 코드를 수정하지 않고 여러분의 Spring Boot 백엔드를 연동하는 방법을 설명합니다.

### 중요 사항
- 프론트엔드 코드는 수정하지 않습니다
- 모든 API 응답은 정해진 형식을 따라야 합니다
- 백엔드 서버는 반드시 8080 포트를 사용해야 합니다
- 모든 API 엔드포인트는 `/api`로 시작해야 합니다

## 프론트엔드 실행 방법

### 필수 환경
- Node.js 18 이상
- npm 9 이상

### 설치 및 실행
```bash
# 프로젝트 클론
git clone [프로젝트_URL]

# 의존성 설치
npm install --legacy-peer-deps

# 개발 서버 실행 (3000번 포트)
npm start
```

## Docker로 실행하기

Docker를 사용하면 Node.js 설치 없이 바로 프로젝트를 실행할 수 있습니다.

### 필수 환경
- [Docker](https://docs.docker.com/get-docker/) 20.10 이상
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0 이상

### 빠른 시작

#### 방법 1: Docker Compose 사용 (권장)
```bash
# 프로덕션 환경으로 실행
docker-compose up -d

# 브라우저에서 http://localhost:3000 접속
```

#### 방법 2: 개발 환경 (Hot Reload)
```bash
# 개발 서버 실행 (코드 변경 시 자동 반영)
docker-compose -f docker-compose.dev.yml up -d

# 브라우저에서 http://localhost:3000 접속
```

#### 방법 3: Docker 명령어 직접 사용
```bash
# 이미지 빌드
docker build -t taskflow-frontend:latest .

# 컨테이너 실행
docker run -d -p 3000:80 --name taskflow-frontend taskflow-frontend:latest

# 브라우저에서 http://localhost:3000 접속
```

### Docker 이미지 공유

팀원들과 Docker 이미지를 공유하는 방법:

#### 1. Docker Hub 사용
```bash
# 이미지 빌드 및 태그
docker build -t your-username/taskflow-frontend:latest .

# Docker Hub에 푸시
docker push your-username/taskflow-frontend:latest

# 팀원이 받기
docker pull your-username/taskflow-frontend:latest
docker run -d -p 3000:80 your-username/taskflow-frontend:latest
```

#### 2. 파일로 공유
```bash
# 이미지를 tar 파일로 저장
docker save -o taskflow-frontend.tar taskflow-frontend:latest

# 팀원이 tar 파일 로드
docker load -i taskflow-frontend.tar
docker run -d -p 3000:80 taskflow-frontend:latest
```

### 상세 가이드

Docker 사용에 대한 자세한 내용은 [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)를 참고하세요.

- 개발/프로덕션 환경 설정
- 백엔드 서버와 함께 실행하기
- 환경 변수 설정
- 문제 해결
- 성능 최적화

## 백엔드 요구사항

### 기술 스택
- Java 17 이상
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- JWT 인증

### 필수 설정
```properties
# application.properties
# 서버 포트 (변경 불가)
server.port=8080

# API 기본 경로 (변경 불가)
server.servlet.context-path=/api

# CORS 설정 (필수)
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

## API 명세

### API 명세 작성의 중요성
- 프론트엔드와 백엔드 개발자 간의 명확한 인터페이스 정의
- 데이터 구조와 통신 방식을 표준화하여 개발 효율성 향상
- API 문서화를 통한 유지보수성 개선

### API 명세 작성 시 고려사항
1. **엔드포인트 구조**
   - RESTful API 설계 원칙 준수
   - 리소스 중심의 URL 구조 설계
   - HTTP 메서드(GET, POST, PUT, DELETE 등)의 적절한 사용

2. **요청/응답 형식**
   - JSON 형식의 데이터 구조 정의
   - 요청 파라미터와 응답 데이터의 타입 명시
   - 에러 처리 방안 정의

3. **인증/인가**
   - JWT, OAuth 등 인증 방식 정의
   - 권한에 따른 API 접근 제어 방안

4. **API 버전 관리**
   - 버전 관리 전략 수립
   - 하위 호환성 유지 방안

### API 명세 문서화 도구
- Swagger/OpenAPI
- Postman
- API Blueprint
- RAML

### API 명세 작성 예시
```typescript
// 사용자 정보 조회 API
GET /api/v1/users/{userId}

Request:
- Path Parameters:
  - userId: string (required)

Response:
{
  "id": string,
  "name": string,
  "email": string,
  "createdAt": string
}

Error Response:
{
  "code": number,
  "message": string
}
```

### 프론트엔드-백엔드 협업 시 주의사항
1. **명확한 커뮤니케이션**
   - API 변경사항에 대한 사전 공유
   - 프론트엔드 요구사항의 명확한 전달

2. **테스트 환경 구축**
   - Mock API 서버 활용
   - API 테스트 자동화

3. **에러 처리**
   - 일관된 에러 응답 형식
   - 프론트엔드에서의 에러 핸들링 방안

4. **성능 최적화**
   - API 응답 시간 최적화
   - 캐싱 전략 수립

### 공통 응답 형식
```typescript
{
    "success": boolean,    // true/false
    "message": string,     // 응답 메시지
    "data": T,            // 실제 데이터 (null 가능)
    "timestamp": string    // ISO 8601 형식
}
```

### 인증 API

#### 회원가입 (POST /api/auth/register)
```typescript
// Request
{
    "email": string,      // 이메일 (필수)
    "password": string,   // 비밀번호 (필수)
    "name": string       // 이름 (필수)
}

// Response
{
    "success": true,
    "message": "회원가입이 완료되었습니다.",
    "data": {
        "id": number,
        "email": string,
        "name": string
    },
    "timestamp": string
}
```

#### 로그인 (POST /api/auth/login)
```typescript
// Request
{
    "email": string,
    "password": string
}

// Response
{
    "success": true,
    "message": "로그인이 완료되었습니다.",
    "data": {
        "token": string,           // JWT 토큰 (필수)
        "user": {
            "id": number,
            "email": string,
            "name": string
        }
    },
    "timestamp": string
}
```

### 태스크 API

#### 태스크 목록 조회 (GET /api/tasks)
```typescript
// Response
{
    "success": true,
    "message": "태스크 목록을 조회했습니다.",
    "data": [
        {
            "id": number,
            "title": string,
            "description": string,
            "status": "TODO" | "IN_PROGRESS" | "COMPLETED",
            "dueDate": string,     // ISO 8601
            "createdAt": string,   // ISO 8601
            "updatedAt": string,   // ISO 8601
            "assignee": {
                "id": number,
                "name": string
            }
        }
    ],
    "timestamp": string
}
```

#### 태스크 생성 (POST /api/tasks)
```typescript
// Request
{
    "title": string,
    "description": string,
    "dueDate": string,    // ISO 8601
    "assigneeId": number  // Optional
}

// Response: 생성된 태스크 정보
```

#### 태스크 수정 (PUT /api/tasks/{id})
```typescript
// Request
{
    "title": string,
    "description": string,
    "status": "TODO" | "IN_PROGRESS" | "COMPLETED",
    "dueDate": string,
    "assigneeId": number
}

// Response: 수정된 태스크 정보
```

### 댓글 API

#### 태스크별 댓글 목록 (GET /api/comments/{taskId})
```typescript
// Response
{
    "success": true,
    "message": "댓글 목록을 조회했습니다.",
    "data": [
        {
            "id": number,
            "content": string,
            "createdAt": string,
            "updatedAt": string,
            "author": {
                "id": number,
                "name": string
            }
        }
    ],
    "timestamp": string
}
```

## 데이터 모델

### User
```java
public class User {
    private Long id;
    private String email;    // unique
    private String password; // 암호화 필수
    private String name;
    private Role role;       // ENUM: USER, ADMIN
}
```

### Task
```java
public class Task {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;  // ENUM: TODO, IN_PROGRESS, COMPLETED
    private LocalDateTime dueDate;
    private User assignee;      // ManyToOne
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Comment
```java
public class Comment {
    private Long id;
    private String content;
    private Task task;          // ManyToOne
    private User author;        // ManyToOne
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

## 인증과 인가

### JWT 토큰 요구사항
- 토큰 타입: Bearer
- 만료 시간: 24시간
- 필수 클레임: userId, email
- 헤더 형식: `Authorization: Bearer {token}`

### 보안 설정 예시
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

## CORS 설정

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")  // 프론트엔드 주소
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## 자주 발생하는 문제

### 1. CORS 오류
- 증상: 프론트엔드 콘솔에 CORS 에러 발생
- 해결: 
  - CORS 설정이 정확한지 확인
  - 프론트엔드 주소(localhost:3000)가 허용되어 있는지 확인
  - OPTIONS 메소드가 허용되어 있는지 확인

### 2. 인증 오류
- 증상: 401 Unauthorized 에러
- 해결:
  - JWT 토큰 형식이 올바른지 확인
  - Authorization 헤더에 "Bearer " 접두어가 포함되어 있는지 확인
  - 토큰이 만료되지 않았는지 확인

### 3. API 응답 형식 오류
- 증상: 프론트엔드에서 데이터를 표시하지 못함
- 해결:
  - 응답이 정확한 JSON 형식인지 확인
  - success, message, data, timestamp 필드가 모두 포함되어 있는지 확인
  - 날짜가 ISO 8601 형식인지 확인

### 4. 데이터 형식 오류
- 증상: 400 Bad Request 에러
- 해결:
  - 요청/응답의 데이터 타입이 명세와 일치하는지 확인
  - 필수 필드가 모두 포함되어 있는지 확인
  - 열거형(Enum) 값이 정확한지 확인

## 테스트 체크리스트

1. 기본 설정
   - [ ] 8080 포트로 서버 실행
   - [ ] CORS 설정 완료
   - [ ] JWT 설정 완료

2. API 구현
   - [ ] 회원가입 API 구현
   - [ ] 로그인 API 구현
   - [ ] 태스크 CRUD API 구현
   - [ ] 댓글 CRUD API 구현

3. 데이터 검증
   - [ ] 모든 API 응답이 공통 형식을 따르는지 확인
   - [ ] 날짜가 ISO 8601 형식인지 확인
   - [ ] 필수 필드가 누락되지 않았는지 확인

## 도움말

프로젝트 진행 중 문제가 발생하면 다음 순서로 해결해보세요:

1. 콘솔 로그 확인
   - 프론트엔드 개발자 도구의 Console 탭
   - 백엔드 서버의 로그

2. 네트워크 요청 확인
   - 프론트엔드 개발자 도구의 Network 탭
   - 요청/응답 헤더와 본문 검사

3. API 테스트
   - Postman이나 curl로 API 직접 테스트
   - 응답 형식과 데이터 검증

4. 문의하기
   - GitHub Issues에 문제 상황 설명
   - 에러 메시지와 재현 방법 포함 