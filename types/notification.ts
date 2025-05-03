export interface Notifications {
    id?: string;
    commentId?: string;
    title?: string;
    notificationType?: string;
    content?: string;
    message?: string;
    authorName?: string;
    product?: string;
    identifierId?: string;
    itemTitle?: string;
    read?: boolean;
    createdAt?: string;
    readAt?: string | null;
    formattedTimeAgo?: string;
}

export interface NotificationItem {
    id?: string;
    commentId?: string;
    title?: string;
    notificationType?: 'comment' | string;
    content?: string;
    message?: string;
    authorName?: string;
    product?: string;
    identifierId?: string;
    itemTitle?: string;
    read?: boolean;
    createdAt?: string;
    readAt?: string | null;
    formattedTimeAgo?: string;
}
  
  export interface NotificationResponse {
    notification?: NotificationItem;
    unreadCount: number;
    timestamp: number;
  }
  
  export interface NotificationState {
    items: NotificationItem[];
    unreadCount: number;
  }