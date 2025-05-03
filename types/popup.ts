import { InspectionData } from "./inpection";

export interface NotificationPopupProps {
    isVisible: boolean;
    setInspectionNames: (value: any) => void;
    inspectionNames: {[key: string]: string};
    onClose: () => void;
    popupRef: React.RefObject<HTMLDivElement>;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    unread: boolean;
}   