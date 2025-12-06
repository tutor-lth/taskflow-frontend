import { format, formatDistance, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜를 한국어 표시 형식으로 변환 (예: "2023년 1월 1일")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy년 M월 d일', { locale: ko });
  } catch (error) {
    console.error('잘못된 날짜 형식:', error);
    return '날짜 없음';
  }
};

/**
 * 날짜와 시간을 한국어 형식으로 변환 (예: "2023년 1월 1일 14시 30분")
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy년 M월 d일 HH시 mm분', { locale: ko });
  } catch (error) {
    console.error('잘못된 날짜 형식:', error);
    return '날짜 없음';
  }
};

/**
 * 상대적 시간 표시 (예: "2일 전")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: ko });
  } catch (error) {
    console.error('잘못된 날짜 형식:', error);
    return '날짜 없음';
  }
};

/**
 * 긴 텍스트를 줄임표로 자름
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength
    ? `${text.substring(0, maxLength)}...`
    : text;
}; 