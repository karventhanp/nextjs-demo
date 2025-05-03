import { useAppContext } from "@/context/AppContext";
import { getLogoName } from "@/helpers/helper";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import { notificationService } from "@/services/notificationService";
import { Notifications } from "@/types/notification";
import { NotificationPopupProps, Notification } from "@/types/popup";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isVisible, inspectionNames,
  popupRef, onClose
}) => {

  if (!isVisible) return null;
  const { userId, notifications, setNotifications, handleTabSwitch } = useAppContext();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');
  const [filteredNotifications, setFilteredNotifications] = useState<Notifications[]>([]);
  const width = useScreenWidth();
  
  const handleCommentRead = async (commentId: string | undefined, type: string, unread: boolean | undefined) => {
    if (type === 'view') {
      handleTabSwitch();
      onClose();
    }
    
    if (!unread) {
      try {
        await notificationService.markAsRead(userId, commentId);
        // Update notifications after marking as read
        const updatedNotifications = notifications.items?.map(notification => {
          if (commentId) {
            // Update specific notification
            if (notification.commentId === commentId) {
              return { ...notification, read: true };
            }
          } else {
            // Mark all as read
            return { ...notification, read: true };
          }
          return notification;
        });
  
        // Update context with new notifications
        if (updatedNotifications) {
          const unreadCount = updatedNotifications.filter(n => !n.read).length;
          setNotifications({
            items: updatedNotifications,
            unreadCount: unreadCount
          });
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  useEffect(() => {
    if (!notifications.items) return;
  
    const filtered = notifications.items.filter(notification => 
      selectedFilter === 'all' ? true : !notification.read
    );

    const sortedNotifications = [...filtered].sort((currentItem, nextItem) => {
      if (!currentItem.read && nextItem.read) return -1;
      if (currentItem.read && !nextItem.read) return 1;
      
      return new Date(nextItem.createdAt || 0).getTime() - new Date(currentItem.createdAt || 0).getTime();
    });
  
    setFilteredNotifications(sortedNotifications);
  }, [selectedFilter, notifications, notifications.unreadCount]);

  return (
    <div
      ref={popupRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-13  right-2 w-[calc(100vw-3rem)] sm:w-100 md:w-100 lg:w-95 2xl:w-105 sm:left-auto sm:right-0 p-4 rounded-xl shadow-md h-125 sm:h-105 bg-snow z-[100]"
    >
      <h5 className="text-sm text-liver mb-3">Notification</h5>
      <div className={`flex ${width < 350 ? 'flex-col' : 'flex-row'}  gap-1  items-center justify-between mb-3`}>
        <div className={`flex ${width < 350 && 'w-full mb-2'} bg-ghostWhite rounded-md p-1`}>
        <button 
            className={`${width < 350 && 'w-1/2'} px-4 py-2 text-sm border-b-2 transition-colors ${
              selectedFilter === 'all' 
                ? ' text-pineGreen border-pineGreen shadow-md' 
                : 'text-smokyBlack border-transparent'
            }`}
            onClick={() => setSelectedFilter('all')}
          >
            All
          </button>
          <button 
            className={`${width < 350 && 'w-1/2'} px-3 py-2 text-sm border-b-2 transition-colors ${
              selectedFilter === 'unread' 
                ? ' text-pineGreen border-pineGreen shadow-md' 
                : 'text-smokyBlack border-transparent'
            }`}
            onClick={() => setSelectedFilter('unread')}
          >
            Unread
          </button>
        </div>
        <div className={`flex items-center ${ width < 350 && 'justify-end w-full'} gap-1 cursor-pointer`}>
          <Image
            src="/images/mark-as-icon.svg"
            alt="Mark as read"
            width={13}
            height={6}
          />
          <span className="text-primary text-xs" onClick={() => notifications.unreadCount > 0 && handleCommentRead(undefined, 'mark as read', false)}>Mark all as read</span>
        </div>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="flex-1 space-y-2 custom-scrollbar h-87.5 sm:max-h-75 overflow-y-auto w-full ">
          {filteredNotifications.map((notification) =>
            notification.notificationType === "comment" ? (
              <div
                className="flex items-start gap-2 p-2 rounded-lg  hover:bg-lightGray w-full"
                key={notification.commentId}
              >
                <div className="w-9 min-w-9 h-9 flex justify-center items-center font-semibold text-snow bg-primary/65 rounded-full">
                  {" "}
                  {notification.authorName &&
                    getLogoName(notification.authorName)}
                </div>
                <div className="flex flex-1 flex-col gap-2 w-full">
                  <p className="text-xs text-liver">
                    <span className="font-semibold text-smokyBlack">
                      {notification.authorName}
                    </span>{" "}
                    Mentioned you in a comment{" "}
                    <span className="font-semibold text-smokyBlack">
                      {(notification.identifierId &&
                        inspectionNames[notification.identifierId]) ||
                        "Loading..."}
                    </span>{" "}
                  </p>
                  <div className="flex items-center justify-between w-full">
                    <Link
                      href={`/inspections/${notification.identifierId}`}
                      className="text-xs text-azure"
                      onClick={ ()=> { notification.commentId && handleCommentRead(notification.commentId, 'view', notification.read)}}
                    >
                      View Comment{" "}
                    </Link>{" "}
                    <div className="flex items-center gap-1 cursor-pointer">
                      <Image
                        src="/images/mark-as-icon.svg"
                        alt="Mark as read"
                        width={13}
                        height={6}
                      />
                      {notification.read ? (
                        <span></span>
                      ) : (
                        <span
                          className="text-primary text-xs"
                          onClick={() =>
                            notification.commentId &&
                            handleCommentRead(notification.commentId, 'mark as read', notification.read)
                          }
                        >
                          Mark as read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={notification.id}
                className="flex items-start gap-2 p-2 rounded-lg  hover:bg-ghostWhite"
              >
                <Image
                  src="/images/solinas-notify.svg"
                  alt="notify"
                  width={30}
                  height={28}
                />
                <div className="flex-1">
                  <p className="text-xs text-smokyBlack">
                    {notification.title}{" "}
                    <span className="font-normal text-trollyGray">
                      {notification.message}
                    </span>
                  </p>
                  <p className="text-xs text-regentGrey">
                    {notification.formattedTimeAgo}
                  </p>
                </div>
                {notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary self-center"></div>
                )}
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Image
            src="/images/no-notify.svg"
            width={70}
            height={70}
            alt="no notification"
          />
          <p className="text-md mb-2 text-smokyBlack"> No Notifications </p>
          <p className="text-xs text-liver">
            Stay tuned! We will notify you when there’s
            <br />
            something new
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;
