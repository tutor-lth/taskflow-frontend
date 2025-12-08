import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Paper,
  Alert,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getTaskComments, createComment, deleteComment, updateComment } from '../../services/commentService';
import { Comment, CreateCommentRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CommentsProps {
  taskId: number;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: number) => void;
  onDelete: (commentId: number) => void;
  onEdit: (commentId: number, content: string) => void;
  currentUserId?: number;
  level?: number;
  isEditing?: boolean;
  editText?: string;
  onEditTextChange?: (text: string) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onDelete,
  onEdit,
  currentUserId,
  level = 0,
  isEditing = false,
  editText = '',
  onEditTextChange,
  onCancelEdit,
  onSaveEdit,
}) => {
  // YouTube style: 대댓글은 parentId로만 구분하고 들여쓰기로 표시
  const isReply = comment.parentId != null; // null과 undefined 모두 체크

  return (
    <Box 
      sx={{ 
        display: 'flex',
        gap: 2,
        p: 2,
        ml: isReply ? 6 : 0,
        backgroundColor: isReply ? '#f9f9f9' : 'transparent',
        borderRadius: isReply ? 1 : 0,
      }}
    >
      <Avatar sx={{ 
        bgcolor: 'primary.main', 
        width: isReply ? 28 : 36, 
        height: isReply ? 28 : 36,
        fontSize: isReply ? '0.75rem' : '1rem',
        fontWeight: 600
      }}>
        {comment.user?.name?.charAt(0) || 'U'}
      </Avatar>
      
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {comment.user?.name || 'Unknown User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {format(new Date(comment.createdAt), 'PP p')}
          </Typography>
          {currentUserId && comment.userId === currentUserId && (
            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => onEdit(comment.id, comment.content)}
                sx={{ p: 0.5 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(comment.id)}
                sx={{ p: 0.5 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              multiline
              maxRows={6}
              value={editText}
              onChange={(e) => onEditTextChange?.(e.target.value)}
              size="small"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '0.875rem',
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
              <Button
                size="small"
                onClick={onCancelEdit}
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none'
                }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => onSaveEdit?.(comment.id)}
                disabled={!editText.trim() || editText === comment.content}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                저장
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              mb: 1,
              whiteSpace: 'pre-line',
              fontSize: '0.875rem',
              lineHeight: 1.4
            }}
          >
            {comment.content}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isReply && !isEditing && (
            <Button
              size="small"
              onClick={() => onReply(comment.id)}
              sx={{
                fontSize: '0.75rem',
                minHeight: 'auto',
                p: 0.5,
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              답글
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const Comments: React.FC<CommentsProps> = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 최초 로딩인지 체크
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const pageSize = 10;
  const loadingRef = useRef(false);

  const fetchComments = useCallback(async (page: number = 0, append: boolean = false) => {
    try {
      console.log(`댓글 로딩 시작: 페이지 ${page}, append: ${append}, 정렬: ${sortOrder}`);
      
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const response = await getTaskComments(taskId, page, pageSize, sortOrder);
      
      if (response.success && response.data) {
        const newComments = response.data.content;
        
        console.log(`댓글 로딩 완료: ${newComments.length}개, 전체 페이지: ${response.data.totalPages}, 현재 페이지: ${response.data.number}, 전체 댓글: ${response.data.totalElements}개`);
        
        if (append) {
          setComments(prev => {
            const updated = [...prev, ...newComments];
            console.log(`댓글 추가: 기존 ${prev.length}개 + 새로운 ${newComments.length}개 = 총 ${updated.length}개`);
            return updated;
          });
        } else {
          setComments(newComments);
        }
        
        // Update total comments count
        setTotalComments(response.data.totalElements);
        setHasMore(response.data.number < response.data.totalPages - 1);
        setCurrentPage(page);
        
        console.log(`hasMore: ${response.data.number < response.data.totalPages - 1}`);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsInitialLoad(false); // 첫 번째 로딩 완료 표시
    }
  }, [taskId, sortOrder]); // pageSize는 상수이므로 의존성에서 제거

  const handleLoadMore = useCallback(() => {
    console.log('handleLoadMore 호출됨:', {
      loadingMore,
      hasMore,
      loadingRefCurrent: loadingRef.current,
      currentPage
    });
    
    if (!loadingMore && hasMore && !loadingRef.current) {
      console.log('조건 통과, fetchComments 호출 예정. 다음 페이지:', currentPage + 1);
      loadingRef.current = true;
      fetchComments(currentPage + 1, true).finally(() => {
        loadingRef.current = false;
        console.log('fetchComments 완료, loadingRef를 false로 설정');
      });
    } else {
      console.log('조건 불만족으로 fetchComments 호출하지 않음');
    }
  }, [loadingMore, hasMore, currentPage, fetchComments]);

  // 초기 로딩과 정렬 변경 시에만 실행
  useEffect(() => {
    fetchComments(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, sortOrder]); // fetchComments를 의존성에 포함하면 무한 루프 발생

  // 무한 스크롤을 위한 scroll 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      console.log('스크롤 이벤트:', {
        loadingRefCurrent: loadingRef.current,
        hasMore,
        loadingMore
      });
      
      if (loadingRef.current || !hasMore) {
        console.log('스크롤 이벤트 무시:', { 
          loadingRefCurrent: loadingRef.current, 
          hasMore 
        });
        return;
      }

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollPercent = ((scrollTop + clientHeight) / scrollHeight) * 100;

      console.log('스크롤 정보:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollPercent: scrollPercent.toFixed(2) + '%'
      });

      // 스크롤이 80% 지점에 도달하면 다음 페이지 로드
      if (scrollPercent >= 80) {
        console.log('무한 스크롤 트리거! 페이지:', currentPage + 1, '조건:', {
          loadingMore,
          hasMore,
          loadingRefCurrent: loadingRef.current
        });
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, handleLoadMore, currentPage, loadingMore]);



  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !user) return;
    
    try {
      const commentRequest: CreateCommentRequest = {
        content: commentText,
      };
      
      const response = await createComment(taskId, commentRequest);
      if (response.success && response.data) {
        // Refresh comments to get the updated structure
        fetchComments(0, false);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyText.trim() || !user) return;
    
    try {
      const commentRequest: CreateCommentRequest = {
        content: replyText,
        parentId,
      };
      
      const response = await createComment(taskId, commentRequest);
      if (response.success && response.data) {
        // Refresh comments to get the updated structure
        fetchComments(0, false);
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (err) {
      console.error('Error creating reply:', err);
      setError('답글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('이 댓글을 삭제하시겠습니까? 답글도 함께 삭제됩니다.')) return;
    
    try {
      const response = await deleteComment(taskId, commentId);
      if (response.success) {
        // Refresh comments to get the updated structure
        fetchComments(0, false);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleReply = (parentId: number) => {
    setReplyingTo(parentId);
    setReplyText('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleEdit = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditText(content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editText.trim()) return;

    try {
      const response = await updateComment(taskId, commentId, editText);
      if (response.success && response.data) {
        // 로컬 상태에서 해당 댓글만 업데이트
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, content: editText, updatedAt: response.data!.updatedAt }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditText('');
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleSortChange = (newSortOrder: 'newest' | 'oldest') => {
    setSortOrder(newSortOrder);
    // 정렬 변경 시 상태 초기화
    setCurrentPage(0);
    setHasMore(true);
    setComments([]);
    setIsInitialLoad(true); // 정렬 변경 시에도 로딩 표시
    // sortOrder 변경으로 useEffect가 자동으로 fetchComments를 호출함
  };

  // 중복된 댓글 제거 (렌더링 직전에 필터링)
  const uniqueComments = useMemo(() => {
    const seen = new Set<number>();
    return comments.filter(comment => {
      if (seen.has(comment.id)) {
        return false;
      }
      seen.add(comment.id);
      return true;
    });
  }, [comments]);

  if (isInitialLoad || (loading && comments.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          댓글 {totalComments > 0 && `${totalComments}개`}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
            }}
          >
            <MenuItem value="newest" sx={{ fontSize: '0.875rem' }}>최신순</MenuItem>
            <MenuItem value="oldest" sx={{ fontSize: '0.875rem' }}>오래된순</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main comment input - YouTube style at top */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="댓글 추가..."
            multiline
            maxRows={6}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
                borderBottom: '1px solid #e0e0e0',
                pb: 1,
                '&:focus': {
                  borderBottom: '2px solid #1976d2',
                }
              }
            }}
          />
          {commentText.trim() && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
              <Button 
                size="small" 
                onClick={() => setCommentText('')}
                sx={{ 
                  color: 'text.secondary',
                  textTransform: 'none'
                }}
              >
                취소
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                댓글
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Comments list */}
      <Box>
        {uniqueComments.length > 0 ? (
          uniqueComments.map((comment) => (
            <React.Fragment key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={handleReply}
                onDelete={handleDeleteComment}
                onEdit={handleEdit}
                currentUserId={user?.id}
                isEditing={editingCommentId === comment.id}
                editText={editText}
                onEditTextChange={setEditText}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
              />
              
              {replyingTo === comment.id && (
                <Box sx={{ display: 'flex', gap: 2, ml: 6, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28 }}>
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="답글 추가..."
                      multiline
                      maxRows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      InputProps={{
                        disableUnderline: true,
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: '0.875rem',
                          borderBottom: '1px solid #e0e0e0',
                          pb: 1,
                          '&:focus': {
                            borderBottom: '2px solid #1976d2',
                          }
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                      <Button 
                        size="small" 
                        onClick={cancelReply}
                        sx={{ 
                          color: 'text.secondary',
                          textTransform: 'none'
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyText.trim()}
                        sx={{ 
                          textTransform: 'none',
                          borderRadius: 2
                        }}
                      >
                        답글
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </React.Fragment>
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            color: 'text.secondary'
          }}>
            <Typography variant="body1">
              아직 댓글이 없습니다.
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              첫 번째 댓글을 작성해보세요!
            </Typography>
          </Box>
        )}
        
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {/* 임시 디버깅용 더 보기 버튼 */}
        {hasMore && !loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              sx={{ textTransform: 'none' }}
            >
              더 보기 (현재 {uniqueComments.length}개 / 전체 {totalComments}개)
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default Comments;