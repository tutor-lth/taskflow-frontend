import { Task, User, Team, Comment, Activity, TaskStatus, TaskPriority, UserRole, DashboardStats, MyTaskSummary, ApiResponse, PagedResponse, PagedApiResponse, ActivityLog, ActivityType, CreateTeamRequest, UpdateTeamRequest, AddMemberRequest } from '../types';
import { subDays, addDays, format } from 'date-fns';
import { ActivityLogFilters } from './activityService';

// Mock data
const users: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    name: '관리자',
    role: UserRole.ADMIN,
    password: 'admin123', // Mock 비밀번호
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'johndoe',
    email: 'john@example.com',
    name: '김철수',
    role: UserRole.USER,
    password: 'user123', // Mock 비밀번호
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    username: 'janedoe',
    email: 'jane@example.com',
    name: '이영희',
    role: UserRole.USER,
    password: 'user123', // Mock 비밀번호
    createdAt: new Date().toISOString(),
  },
];

const teams: Team[] = [
  {
    id: 1,
    name: '개발팀',
    description: '프론트엔드 및 백엔드 개발자들',
    createdAt: new Date().toISOString(),
    members: [users[0], users[1]],
  },
  {
    id: 2,
    name: '디자인팀',
    description: 'UI/UX 디자이너들',
    createdAt: new Date().toISOString(),
    members: [users[2]],
  },
];

const tasks: Task[] = [
  {
    id: 1,
    title: '사용자 인증 구현',
    description: 'API용 JWT 인증 시스템을 구현합니다',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    assigneeId: 1,
    assignee: users[0],
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
    dueDate: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 2,
    title: '대시보드 UI 디자인',
    description: '대시보드를 위한 와이어프레임을 제작합니다',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    assigneeId: 3,
    assignee: users[2],
    createdAt: subDays(new Date(), 7).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    dueDate: addDays(new Date(), 2).toISOString(),
  },
  {
    id: 3,
    title: '작업 보드 구현',
    description: '드래그 앤 드롭 기능이 있는 작업 보드 컴포넌트를 만듭니다',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assigneeId: 2,
    assignee: users[1],
    createdAt: subDays(new Date(), 3).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    dueDate: addDays(new Date(), 5).toISOString(),
  },
  {
    id: 4,
    title: 'API 문서화',
    description: '모든 API 엔드포인트에 대한 문서를 작성합니다',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    assigneeId: 1,
    assignee: users[0],
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    dueDate: addDays(new Date(), 10).toISOString(),
  },
  {
    id: 5,
    title: '로그인 버그 수정',
    description: '모바일 디바이스에서 로그인 문제를 해결합니다',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    assigneeId: 2,
    assignee: users[1],
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: addDays(new Date(), 1).toISOString(),
  },
  {
    id: 6,
    title: 'FE 연동',
    description: 'FE와 연동을 해봅니다.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    assigneeId: 1,
    assignee: users[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
  },
  {
    id: 7,
    title: 'FE 연동 테스트',
    description: 'FE와 연동 확인 및 테스트합니다.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    assigneeId: 1,
    assignee: users[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
  },
  {
    id: 8,
    title: '테스트',
    description: 'FE와 연동 확인 및 테스트합니다.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    assigneeId: 1,
    assignee: users[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date().toISOString(),
  }
];

const comments: Comment[] = [
  {
    id: 1,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '인증 서비스 구현을 완료했습니다',
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 15).toISOString(),
  },
  {
    id: 2,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '좋은 작업입니다! 인증이 완벽하게 작동하고 있네요.',
    parentId: 1, // Reply to comment 1
    createdAt: subDays(new Date(), 14).toISOString(),
    updatedAt: subDays(new Date(), 14).toISOString(),
  },
  {
    id: 3,
    taskId: 2,
    userId: 3,
    user: users[2],
    content: '와이어프레임 작업 중입니다. 곧 공유하겠습니다.',
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 4,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '감사합니다! 테스트 케이스도 모두 통과하고 있어요.',
    parentId: 2, // Reply to comment 2
    createdAt: subDays(new Date(), 13).toISOString(),
    updatedAt: subDays(new Date(), 13).toISOString(),
  },
  {
    id: 5,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '혹시 보안 관련해서 추가 검토가 필요할까요?',
    createdAt: subDays(new Date(), 12).toISOString(),
    updatedAt: subDays(new Date(), 12).toISOString(),
  },
  // Add more comments for taskId=1 to test infinite scroll
  {
    id: 7,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: 'JWT 토큰 만료 시간은 어떻게 설정하셨나요?',
    createdAt: subDays(new Date(), 11).toISOString(),
    updatedAt: subDays(new Date(), 11).toISOString(),
  },
  {
    id: 8,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '현재 24시간으로 설정했습니다. 필요하면 조정 가능해요.',
    parentId: 7,
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 10).toISOString(),
  },
  {
    id: 9,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '리프레시 토큰도 구현되어 있나요?',
    createdAt: subDays(new Date(), 9).toISOString(),
    updatedAt: subDays(new Date(), 9).toISOString(),
  },
  {
    id: 10,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '네, 리프레시 토큰도 포함되어 있습니다. 유효기간은 7일입니다.',
    parentId: 9,
    createdAt: subDays(new Date(), 8).toISOString(),
    updatedAt: subDays(new Date(), 8).toISOString(),
  },
  {
    id: 11,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '소셜 로그인도 지원하나요?',
    createdAt: subDays(new Date(), 7).toISOString(),
    updatedAt: subDays(new Date(), 7).toISOString(),
  },
  {
    id: 12,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '현재는 이메일/비밀번호만 지원하고, 소셜 로그인은 다음 단계로 계획되어 있습니다.',
    parentId: 11,
    createdAt: subDays(new Date(), 6).toISOString(),
    updatedAt: subDays(new Date(), 6).toISOString(),
  },
  {
    id: 13,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '비밀번호 복잡성 검증도 포함되어 있나요?',
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
  },
  {
    id: 14,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '네, 최소 8자리에 대소문자, 숫자, 특수문자를 포함하도록 구현했습니다.',
    parentId: 13,
    createdAt: subDays(new Date(), 4).toISOString(),
    updatedAt: subDays(new Date(), 4).toISOString(),
  },
  {
    id: 15,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '2FA(이중 인증)은 어떤가요?',
    createdAt: subDays(new Date(), 3).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
  },
  {
    id: 16,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '2FA는 향후 버전에서 추가 예정입니다. 현재는 기본 인증에 집중했습니다.',
    parentId: 15,
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 17,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '계정 잠금 기능은 구현되어 있나요?',
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 18,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '5회 연속 로그인 실패 시 15분간 계정이 잠기도록 구현했습니다.',
    parentId: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 19,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '정말 훌륭한 작업이네요! 보안 측면에서 잘 고려된 것 같습니다.',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 20,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '이제 프론트엔드 통합 작업을 시작할 수 있겠네요.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 21,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '네, API 문서도 업데이트했으니 참고해주세요!',
    parentId: 20,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 22,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '테스트 코드 커버리지는 어떻게 되나요?',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 23,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '현재 95% 커버리지를 달성했습니다. 모든 주요 케이스를 다루고 있어요.',
    parentId: 22,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    taskId: 2,
    userId: 1,
    user: users[0],
    content: '기대하고 있겠습니다! 언제쯤 초안을 볼 수 있을까요?',
    parentId: 3, // Reply to comment 3
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 7,
    taskId: 2,
    userId: 3,
    user: users[2],
    content: '이번 주 금요일까지 초안을 공유하겠습니다.',
    parentId: 6, // Reply to comment 6
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 8,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '코드 품질이 정말 좋아졌네요. 팀 전체적으로 실력이 향상된 것 같습니다.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 9,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '다음 프로젝트에서는 TDD를 도입해보는 것도 좋을 것 같아요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 10,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: 'TDD 좋은 생각이네요! 테스트 코드 작성 가이드라인도 만들어보죠.',
    parentId: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 11,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '성능 최적화 결과를 공유해주세요. 어떤 부분이 가장 많이 개선되었나요?',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 12,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '가장 큰 개선은 데이터베이스 쿼리 최적화였습니다. 50% 이상 빨라졌어요.',
    parentId: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 13,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '놀랍네요! 구체적인 최적화 방법을 문서로 정리해주시면 팀에 도움이 될 것 같아요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 14,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '이번 기능 개발로 많은 것을 배웠습니다. 감사합니다!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 15,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '앞으로도 이런 식으로 협력해나가면 좋겠어요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 16,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '정말 유익한 프로젝트였습니다. 다음에도 함께 작업했으면 좋겠어요!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 17,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '이번에 배운 기술들을 다른 프로젝트에도 적용해보고 싶어요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 18,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '좋은 아이디어네요! 기술 공유 세션도 가져보면 어떨까요?',
    parentId: 17,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 19,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '이번 스프린트에서 가장 인상깊었던 것은 팀워크였어요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 20,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '저도 같은 생각입니다. 서로 도와가며 문제를 해결하는 모습이 좋았어요.',
    parentId: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 21,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '다음 프로젝트에서는 더 도전적인 기술을 시도해볼까요?',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 22,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: 'GraphQL이나 마이크로서비스 아키텍처는 어떨까요?',
    parentId: 21,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 23,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '컨테이너화도 고려해볼 만하겠네요. Docker와 Kubernetes를 활용해보면?',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 24,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '모든 아이디어가 흥미롭네요! 기술 스택 검토 미팅을 잡아보죠.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 25,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '이번 프로젝트를 통해 많은 성장을 했다고 느껴집니다.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 26,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '개발 프로세스도 많이 개선되었어요. 코드 리뷰 문화가 정착되었네요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 27,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '버그 발생률도 현저히 줄었고, 코드 품질이 향상되었습니다.',
    parentId: 26,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 28,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '사용자 피드백도 매우 긍정적이었어요. 특히 성능 개선 부분에서요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 29,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '다음 릴리즈 때는 더 많은 기능을 추가할 수 있을 것 같아요.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 30,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '팀의 역량이 많이 향상되었네요. 자신감도 생겼고요!',
    parentId: 29,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 31,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '이제 더 복잡한 프로젝트도 충분히 해낼 수 있을 것 같습니다.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 32,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '정말 좋은 경험이었어요. 모든 팀원들에게 감사드립니다!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 33,
    taskId: 1,
    userId: 1,
    user: users[0],
    content: '이번 프로젝트의 성공을 바탕으로 더 큰 도전을 해봅시다!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 34,
    taskId: 1,
    userId: 2,
    user: users[1],
    content: '네, 기대됩니다! 계속해서 혁신적인 솔루션을 만들어나가요.',
    parentId: 33,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 35,
    taskId: 1,
    userId: 3,
    user: users[2],
    content: '함께 성장하는 팀이 되어 정말 기쁩니다!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const activities: Activity[] = [
  {
    id: 1,
    userId: 1,
    user: users[0],
    action: 'created_task',
    targetType: 'task',
    targetId: 1,
    description: '"사용자 인증 구현" 작업을 생성했습니다',
    createdAt: subDays(new Date(), 10).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    user: users[0],
    action: 'updated_status',
    targetType: 'task',
    targetId: 1,
    description: '"사용자 인증 구현"을 완료로 이동했습니다',
    createdAt: subDays(new Date(), 5).toISOString(),
  },
  {
    id: 3,
    userId: 3,
    user: users[2],
    action: 'created_task',
    targetType: 'task',
    targetId: 2,
    description: '"대시보드 UI 디자인" 작업을 생성했습니다',
    createdAt: subDays(new Date(), 7).toISOString(),
  },
  {
    id: 4,
    userId: 2,
    user: users[1],
    action: 'added_comment',
    targetType: 'comment',
    targetId: 2,
    description: '"사용자 인증 구현"에 댓글을 작성했습니다',
    createdAt: subDays(new Date(), 4).toISOString(),
  },
];

// Mock activity logs
const activityLogs = [
  {
    id: 1,
    type: 'TASK_CREATED',
    userId: 1,
    user: users[0],
    taskId: 1,
    timestamp: new Date().toISOString(),
    description: '새로운 작업 "사용자 인증 구현"을 생성했습니다.',
  },
  {
    id: 2,
    type: 'TASK_STATUS_CHANGED',
    userId: 1,
    user: users[0],
    taskId: 1,
    timestamp: subDays(new Date(), 1).toISOString(),
    description: '작업 상태를 TODO에서 IN_PROGRESS로 변경했습니다.',
  },
  {
    id: 3,
    type: 'COMMENT_CREATED',
    userId: 2,
    user: users[1],
    taskId: 1,
    timestamp: subDays(new Date(), 2).toISOString(),
    description: '작업 "사용자 인증 구현"에 댓글을 작성했습니다.',
  },
  {
    id: 4,
    type: 'TASK_UPDATED',
    userId: 2,
    user: users[1],
    taskId: 2,
    timestamp: subDays(new Date(), 3).toISOString(),
    description: '작업 "대시보드 UI 디자인" 정보를 수정했습니다.',
  },
  {
    id: 5,
    type: 'TASK_STATUS_CHANGED',
    userId: 3,
    user: users[2],
    taskId: 2,
    timestamp: subDays(new Date(), 4).toISOString(),
    description: '작업 상태를 IN_PROGRESS에서 DONE으로 변경했습니다.',
  },
  {
    id: 6,
    type: 'COMMENT_CREATED',
    userId: 1,
    user: users[0],
    taskId: 2,
    timestamp: subDays(new Date(), 5).toISOString(),
    description: '작업 "대시보드 UI 디자인"에 댓글을 작성했습니다.',
  },
  {
    id: 7,
    type: 'TASK_CREATED',
    userId: 3,
    user: users[2],
    taskId: 3,
    timestamp: subDays(new Date(), 6).toISOString(),
    description: '새로운 작업 "API 문서 작성"을 생성했습니다.',
  },
  {
    id: 8,
    type: 'TASK_DELETED',
    userId: 1,
    user: users[0],
    taskId: 10,
    timestamp: subDays(new Date(), 7).toISOString(),
    description: '작업 "테스트 작업"을 삭제했습니다.',
  },
  {
    id: 9,
    type: 'COMMENT_UPDATED',
    userId: 2,
    user: users[1],
    taskId: 3,
    timestamp: subDays(new Date(), 8).toISOString(),
    description: '댓글을 수정했습니다.',
  },
  {
    id: 10,
    type: 'COMMENT_DELETED',
    userId: 3,
    user: users[2],
    taskId: 3,
    timestamp: subDays(new Date(), 9).toISOString(),
    description: '댓글을 삭제했습니다.',
  },
  {
    id: 11,
    type: 'TASK_STATUS_CHANGED',
    userId: 1,
    user: users[0],
    taskId: 3,
    timestamp: subDays(new Date(), 10).toISOString(),
    description: '작업 상태를 TODO에서 IN_PROGRESS로 변경했습니다.',
  },
  {
    id: 12,
    type: 'TASK_UPDATED',
    userId: 2,
    user: users[1],
    taskId: 1,
    timestamp: subDays(new Date(), 11).toISOString(),
    description: '작업 "사용자 인증 구현" 정보를 수정했습니다.',
  },
];

// Helper functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  message: '성공',
  data,
  timestamp: new Date().toISOString(),
});

function paginateResults<T>(items: T[], page: number, size: number): PagedResponse<T> {
  const start = page * size;
  const content = items.slice(start, start + size);
  
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page
  };
}

// Helper function to organize comments into hierarchical structure
function organizeComments(comments: Comment[]): Comment[] {
  const commentMap = new Map<number, Comment>();
  const topLevelComments: Comment[] = [];

  // First pass: create comment map and initialize replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into hierarchy
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parentId) {
      // This is a reply
      const parentComment = commentMap.get(comment.parentId);
      if (parentComment) {
        parentComment.replies!.push(commentWithReplies);
      }
    } else {
      // This is a top-level comment
      topLevelComments.push(commentWithReplies);
    }
  });

  return topLevelComments;
}

// Mock API handlers
export const mockAuthService = {
  login: async (username: string, password: string) => {
    await delay(500);
    const user = users.find(u => u.username === username);
    
    if (user && password === 'password') {
      return createSuccessResponse({
        token: 'mock-jwt-token',
      });
    }
    
    return {
      success: false,
      message: '잘못된 사용자명 또는 비밀번호입니다',
      data: null,
      timestamp: new Date().toISOString(),
    } as ApiResponse<null>;
  },
  
  register: async (userData: { username: string; email: string; password: string; name: string }) => {
    await delay(700);
    // Check if username or email already exists
    if (users.some(u => u.username === userData.username)) {
      return {
        success: false,
        message: '이미 존재하는 사용자명입니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    if (users.some(u => u.email === userData.email)) {
      return {
        success: false,
        message: '이미 존재하는 이메일입니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    // Create new user
    const newUser: User = {
      id: users.length + 1,
      username: userData.username,
      email: userData.email,
      name: userData.name,
      role: UserRole.USER,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    
    return createSuccessResponse(newUser);
  },
  
  getCurrentUser: async () => {
    await delay(300);
    // 응답에서 password 제거 (보안)
    const { password, ...userResponse } = users[0];
    return createSuccessResponse(userResponse as User);
  },

  getUsers: async () => {
    await delay(500);
    // 응답에서 password 제거 (보안)
    const usersWithoutPassword = users.map(({ password, ...user }) => user as User);
    return createSuccessResponse(usersWithoutPassword);
  },
  
  updateUser: async (id: number, userData: Partial<User>) => {
    await delay(500);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return {
        success: false,
        message: '사용자를 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }

    // 비밀번호 확인 (userData.password가 현재 비밀번호 확인용으로 전달됨)
    if (userData.password && users[userIndex].password !== userData.password) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }

    // Update user (password는 업데이트하지 않음, 확인용으로만 사용)
    const { password, ...updateData } = userData;
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // 응답에서 password 제거 (보안)
    const { password: _, ...userResponse } = users[userIndex];
    return createSuccessResponse(userResponse as User);
  },
  
  verifyPassword: async (password: string) => {
    await delay(500);

    // 현재 로그인된 사용자를 찾기 (실제로는 토큰에서 사용자 정보를 가져와야 하지만, mock에서는 첫 번째 사용자로 가정)
    const currentUser = users[0]; // Mock: 실제로는 인증 토큰에서 사용자 확인

    // 비밀번호 확인
    if (currentUser.password !== password) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }

    return createSuccessResponse({ valid: true });
  },

  withdrawAccount: async () => {
    await delay(700);
    return createSuccessResponse(null);
  },
};

export const mockTaskService = {
  getTasks: async (page = 0, size = 10, status?: TaskStatus, search?: string, assigneeId?: number) => {
    await delay(500);
    
    let filteredTasks = [...tasks];
    
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        task.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (assigneeId) {
      filteredTasks = filteredTasks.filter(task => task.assigneeId === assigneeId);
    }
    
    return createSuccessResponse(paginateResults(filteredTasks, page, size));
  },
  
  getTaskById: async (id: number) => {
    await delay(300);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return {
        success: false,
        message: '작업을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    return createSuccessResponse(task);
  },
  
  createTask: async (taskData: any) => {
    await delay(700);
    
    const newTask: Task = {
      id: tasks.length + 1,
      title: taskData.title,
      description: taskData.description || '',
      status: TaskStatus.TODO,
      priority: taskData.priority,
      assigneeId: taskData.assigneeId,
      assignee: users.find(u => u.id === taskData.assigneeId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: taskData.dueDate || addDays(new Date(), 7).toISOString(),
    };
    
    tasks.push(newTask);
    
    // Create an activity for the new task
    activities.push({
      id: activities.length + 1,
      userId: 1, // Assuming current user is admin
      user: users[0],
      action: 'created_task',
      targetType: 'task',
      targetId: newTask.id,
      description: `"${newTask.title}" 작업을 생성했습니다`,
      createdAt: new Date().toISOString(),
    });
    
    return createSuccessResponse(newTask);
  },
  
  updateTask: async (id: number, taskData: any) => {
    await delay(500);
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return {
        success: false,
        message: '작업을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    
    // Create an activity for the task update
    activities.push({
      id: activities.length + 1,
      userId: 1, // Assuming current user is admin
      user: users[0],
      action: 'updated_task',
      targetType: 'task',
      targetId: id,
      description: `"${updatedTask.title}" 작업을 수정했습니다`,
      createdAt: new Date().toISOString(),
    });
    
    return createSuccessResponse(updatedTask);
  },
  
  updateTaskStatus: async (id: number, status: TaskStatus) => {
    await delay(400);
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return {
        success: false,
        message: '해당 ID의 작업을 찾을 수 없습니다.',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }

    if (!Object.values(TaskStatus).includes(status)) {
      return {
        success: false,
        message: '유효하지 않은 상태값입니다.',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      status,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    
    // Create an activity for the status change
    activities.push({
      id: activities.length + 1,
      userId: 1,
      user: users[0],
      action: 'updated_status',
      targetType: 'task',
      targetId: id,
      description: `작업 상태가 ${status}로 변경되었습니다.`,
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: '작업 상태가 업데이트되었습니다.',
      data: updatedTask,
      timestamp: new Date().toISOString(),
    } as ApiResponse<Task>;
  },
  
  deleteTask: async (id: number) => {
    await delay(600);
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return {
        success: false,
        message: '작업을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    
    // Remove associated comments
    const taskComments = comments.filter(c => c.taskId === id);
    for (const comment of taskComments) {
      const commentIndex = comments.findIndex(c => c.id === comment.id);
      if (commentIndex !== -1) {
        comments.splice(commentIndex, 1);
      }
    }
    
    // Create an activity for the task deletion
    activities.push({
      id: activities.length + 1,
      userId: 1, // Assuming current user is admin
      user: users[0],
      action: 'deleted_task',
      targetType: 'task',
      targetId: id,
      description: `"${deletedTask.title}" 작업을 삭제했습니다`,
      createdAt: new Date().toISOString(),
    });
    
    return createSuccessResponse(null);
  },
  
  searchTasks: async (query: string, page = 0, size = 10) => {
    await delay(400);
    
    const searchLower = query.toLowerCase();
    const filteredTasks = tasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) || 
      task.description.toLowerCase().includes(searchLower)
    );
    
    return createSuccessResponse(paginateResults(filteredTasks, page, size));
  },
};

export const mockCommentService = {
  getTaskComments: async (taskId: number, page: number = 0, size: number = 10, sortOrder: 'newest' | 'oldest' = 'newest') => {
    await delay(300);
    
    // 해당 작업의 모든 댓글 가져오기
    const allTaskComments = comments.filter(c => c.taskId === taskId);
    
    // 부모 댓글들만 먼저 분리하고 정렬
    const parentComments = allTaskComments
      .filter(c => !c.parentId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        
        if (sortOrder === 'newest') {
          return dateB - dateA; // 최신순 (내림차순)
        } else {
          return dateA - dateB; // 오래된순 (오름차순)
        }
      });
    
    // 각 부모 댓글에 대한 대댓글들을 시간순으로 정렬하여 계층 구조 생성
    const organizedComments: Comment[] = [];
    
    parentComments.forEach(parentComment => {
      // 부모 댓글 추가
      organizedComments.push(parentComment);
      
      // 해당 부모 댓글의 대댓글들을 시간순(오름차순)으로 추가
      const replies = allTaskComments
        .filter(c => c.parentId === parentComment.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      organizedComments.push(...replies);
    });
    
    console.log(`목 백엔드: taskId ${taskId}의 전체 댓글 ${organizedComments.length}개 (부모: ${parentComments.length}개), 요청 페이지 ${page}, 크기 ${size}, 정렬: ${sortOrder}`);
    
    const paginatedResult = paginateResults(organizedComments, page, size);
    
    console.log(`목 백엔드 pagination 결과:`, {
      contentLength: paginatedResult.content.length,
      totalElements: paginatedResult.totalElements,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.number,
      hasMore: page < paginatedResult.totalPages - 1,
      startIndex: page * size,
      endIndex: page * size + paginatedResult.content.length
    });
    
    // 실제 반환되는 댓글 ID들 확인 (부모/대댓글 구분)
    console.log('반환되는 댓글:', paginatedResult.content.map(c => ({
      id: c.id,
      parentId: c.parentId || 'root',
      content: c.content.substring(0, 20) + '...'
    })));
    
    return createSuccessResponse(paginatedResult);
  },
  
  createComment: async (taskId: number, commentData: { content: string, parentId?: number }) => {
    await delay(500);
    
    if (!tasks.some(t => t.id === taskId)) {
      return {
        success: false,
        message: '작업을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    // If parentId is provided, verify the parent comment exists and belongs to the same task
    if (commentData.parentId) {
      const parentComment = comments.find(c => c.id === commentData.parentId && c.taskId === taskId);
      if (!parentComment) {
        return {
          success: false,
          message: '대댓글의 부모 댓글을 찾을 수 없습니다',
          data: null,
          timestamp: new Date().toISOString(),
        } as ApiResponse<null>;
      }
    }
    
    const newComment: Comment = {
      id: Math.max(...comments.map(c => c.id), 0) + 1,
      taskId,
      userId: 1, // Assuming current user is admin
      user: users[0],
      content: commentData.content,
      parentId: commentData.parentId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    comments.push(newComment);
    
    // Create an activity for the new comment
    activities.push({
      id: activities.length + 1,
      userId: 1, // Assuming current user is admin
      user: users[0],
      action: 'added_comment',
      targetType: 'comment',
      targetId: newComment.id,
      description: commentData.parentId 
        ? `작업 #${taskId}에 대댓글을 작성했습니다`
        : `작업 #${taskId}에 댓글을 작성했습니다`,
      createdAt: new Date().toISOString(),
    });
    
    return createSuccessResponse(newComment);
  },
  
  updateComment: async (commentId: number, content: string) => {
    await delay(400);
    
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return {
        success: false,
        message: '댓글을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    const updatedComment = {
      ...comments[commentIndex],
      content,
      updatedAt: new Date().toISOString(),
    };
    
    comments[commentIndex] = updatedComment;
    
    return createSuccessResponse(updatedComment);
  },
  
  deleteComment: async (taskId: number, commentId: number) => {
    await delay(400);
    
    const comment = comments.find(c => c.id === commentId && c.taskId === taskId);
    
    if (!comment) {
      return {
        success: false,
        message: '댓글을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    
    // Find all comments to delete (the comment and its replies recursively)
    const commentsToDelete: number[] = [];
    
    const findReplies = (parentId: number) => {
      const replies = comments.filter(c => c.parentId === parentId && c.taskId === taskId);
      replies.forEach(reply => {
        commentsToDelete.push(reply.id);
        findReplies(reply.id); // Recursively find nested replies
      });
    };
    
    commentsToDelete.push(commentId);
    findReplies(commentId);
    
    // Remove all comments
    commentsToDelete.forEach(id => {
      const index = comments.findIndex(c => c.id === id);
      if (index !== -1) {
        comments.splice(index, 1);
      }
    });
    
    // Create an activity for the comment deletion
    activities.push({
      id: activities.length + 1,
      userId: 1, // Assuming current user is admin
      user: users[0],
      action: 'deleted_comment',
      targetType: 'comment',
      targetId: commentId,
      description: `작업 #${taskId}의 댓글${commentsToDelete.length > 1 ? '과 대댓글들' : ''}을 삭제했습니다`,
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: `댓글${commentsToDelete.length > 1 ? '과 대댓글들이' : '이'} 삭제되었습니다.`,
      data: null,
      timestamp: new Date().toISOString(),
    };
  },
};

export const mockTeamService = {
  getTeams: async () => {
    await delay(300);
    return createSuccessResponse(teams);
  },
  
  getTeamById: async (id: number) => {
    await delay(300);
    const team = teams.find(t => t.id === id);
    
    if (!team) {
      return {
        success: false,
        message: '팀을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    return createSuccessResponse(team);
  },
  
  getTeamMembers: async (teamId: number) => {
    await delay(300);
    const team = teams.find(t => t.id === teamId);
    
    if (!team) {
      return {
        success: false,
        message: '팀을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    return createSuccessResponse(team.members || []);
  },

  createTeam: async (request: CreateTeamRequest) => {
    await delay(300);
    
    // Check if team name already exists
    const existingTeam = teams.find(t => t.name === request.name);
    if (existingTeam) {
      return {
        success: false,
        message: '팀 이름이 이미 존재합니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    const newTeam: Team = {
      id: teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1,
      name: request.name,
      description: request.description,
      createdAt: new Date().toISOString(),
      members: []
    };
    
    teams.push(newTeam);
    return createSuccessResponse(newTeam);
  },

  updateTeam: async (id: number, request: UpdateTeamRequest) => {
    await delay(300);
    
    const teamIndex = teams.findIndex(t => t.id === id);
    if (teamIndex === -1) {
      return {
        success: false,
        message: '팀을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    // Check if new name conflicts with existing team
    if (request.name && teams.some(t => t.id !== id && t.name === request.name)) {
      return {
        success: false,
        message: '팀 이름이 이미 존재합니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    if (request.name) teams[teamIndex].name = request.name;
    if (request.description !== undefined) teams[teamIndex].description = request.description;
    
    return createSuccessResponse(teams[teamIndex]);
  },

  deleteTeam: async (id: number) => {
    await delay(300);
    
    const teamIndex = teams.findIndex(t => t.id === id);
    if (teamIndex === -1) {
      return {
        success: false,
        message: '팀을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    teams.splice(teamIndex, 1);
    return createSuccessResponse({ message: '팀이 성공적으로 삭제되었습니다' });
  },

  addMember: async (teamId: number, request: AddMemberRequest) => {
    await delay(300);
    
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return {
        success: false,
        message: '팀을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    const user = users.find(u => u.id === request.userId);
    if (!user) {
      return {
        success: false,
        message: '사용자를 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    // Check if user is already a member
    if (team.members?.some(m => m.id === request.userId)) {
      return {
        success: false,
        message: '사용자가 이미 팀 멤버입니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    if (!team.members) team.members = [];
    team.members.push(user);
    
    return createSuccessResponse(team);
  },

  removeMember: async (teamId: number, userId: number) => {
    await delay(300);
    
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return {
        success: false,
        message: '팀을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    if (!team.members || !team.members.some(m => m.id === userId)) {
      return {
        success: false,
        message: '사용자가 팀 멤버가 아닙니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    team.members = team.members.filter(m => m.id !== userId);
    
    return createSuccessResponse(team);
  },

  getAvailableUsers: async (teamId?: number) => {
    await delay(300);
    
    if (!teamId) {
      return createSuccessResponse(users);
    }
    
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return {
        success: false,
        message: '팀을 찾을 수 없습니다',
        data: null,
        timestamp: new Date().toISOString(),
      } as ApiResponse<null>;
    }
    
    const memberIds = team.members?.map(m => m.id) || [];
    const availableUsers = users.filter(u => !memberIds.includes(u.id));
    
    return createSuccessResponse(availableUsers);
  },
};

export const mockDashboardService = {
  getDashboardStats: async () => {
    await delay(400);
    
    const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const totalTasks = tasks.length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && t.status !== TaskStatus.DONE;
    }).length;
    
    const stats: DashboardStats = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      teamProgress: Math.round((completedTasks / totalTasks) * 100),
      myTasksToday: tasks.filter(t => t.assigneeId === 1).length,
      completionRate: Math.round((completedTasks / totalTasks) * 100),
    };
    
    return createSuccessResponse(stats);
  },
  
  getMyTasks: async () => {
    await delay(500);
    
    const myTasks = tasks.filter(t => t.assigneeId === 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTasks = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
    
    const upcomingTasks = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today && t.status !== TaskStatus.DONE;
    });
    
    const overdueTasks = myTasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && t.status !== TaskStatus.DONE;
    });
    
    const summary: MyTaskSummary = {
      todayTasks,
      upcomingTasks,
      overdueTasks,
    };
    
    return createSuccessResponse(summary);
  },
  
  getTeamProgress: async () => {
    await delay(400);
    
    const teamProgress: { [key: string]: number } = {};
    
    for (const team of teams) {
      const memberIds = team.members?.map(m => m.id) || [];
      const teamTasks = tasks.filter(t => memberIds.includes(t.assigneeId));
      const completedTasks = teamTasks.filter(t => t.status === TaskStatus.DONE).length;
      const progress = teamTasks.length > 0 
        ? Math.round((completedTasks / teamTasks.length) * 100)
        : 0;
      
      teamProgress[team.name] = progress;
    }
    
    return createSuccessResponse(teamProgress);
  },
  
  getActivities: async (page = 0, size = 10) => {
    await delay(300);
    
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return createSuccessResponse(paginateResults(sortedActivities, page, size));
  },
  
  getMyActivities: async (page = 0, size = 10) => {
    await delay(300);
    
    const myActivities = activities.filter(a => a.userId === 1);
    const sortedActivities = [...myActivities].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return createSuccessResponse(paginateResults(sortedActivities, page, size));
  },
  
  search: async (query: string) => {
    await delay(500);
    
    const searchLower = query.toLowerCase();
    
    const matchedTasks = tasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) || 
      task.description.toLowerCase().includes(searchLower)
    );
    
    const matchedUsers = users.filter(user => 
      user.name.toLowerCase().includes(searchLower) || 
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
    
    const matchedTeams = teams.filter(team => 
      team.name.toLowerCase().includes(searchLower) || 
      team.description.toLowerCase().includes(searchLower)
    );
    
    return createSuccessResponse({
      tasks: matchedTasks,
      users: matchedUsers,
      teams: matchedTeams,
    });
  },
  
  getWeeklyTrend: async () => {
    await delay(400);
    
    // 안정적인 주간 추세 데이터 (실제 시나리오를 반영)
    const today = new Date();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const trendData = [];
    
    // 미리 정의된 패턴 데이터 (주중 높고, 주말 낮음)
    const weeklyPattern = [
      { tasks: 2, completed: 1 }, // 일요일
      { tasks: 8, completed: 6 }, // 월요일
      { tasks: 12, completed: 10 }, // 화요일  
      { tasks: 10, completed: 8 }, // 수요일
      { tasks: 9, completed: 7 }, // 목요일
      { tasks: 11, completed: 9 }, // 금요일
      { tasks: 3, completed: 2 }  // 토요일
    ];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const pattern = weeklyPattern[dayOfWeek];
      
      trendData.push({
        name: weekDays[dayOfWeek],
        tasks: pattern.tasks,
        completed: pattern.completed,
        date: date.toISOString().split('T')[0]
      });
    }
    
    return createSuccessResponse(trendData);
  },
};

export const mockActivityService = {
  getActivityLogs: async (
    page: number = 0, 
    size: number = 10,
    filters: ActivityLogFilters = {}
  ): Promise<PagedApiResponse<ActivityLog>> => {
    await delay(500);

    let filteredLogs = [...activityLogs] as ActivityLog[];

    // Apply filters
    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }
    if (filters.taskId) {
      const taskId = parseInt(filters.taskId);
      if (!isNaN(taskId)) {
        filteredLogs = filteredLogs.filter(log => log.taskId === taskId);
      }
    }
    if (filters.userId) {
      const userId = parseInt(filters.userId);
      if (!isNaN(userId)) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }
    }
    if (filters.startDate) {
      const startDate = new Date(filters.startDate).toISOString();
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate).toISOString();
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    // Sort by timestamp descending
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const paginatedLogs = paginateResults(filteredLogs, page, size);

    return {
      success: true,
      message: '',
      data: paginatedLogs,
      timestamp: new Date().toISOString()
    };
  }
}; 