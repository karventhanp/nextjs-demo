import "react-grid-layout/css/styles.css";
import { Layout, WidthProvider, Responsive } from "react-grid-layout";
import { WidgetData } from "@/types/common";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetBoardProps {
  data: WidgetData[];
  onResize?: (element: HTMLElement) => void;
}

const WidgetBoard: React.FC<WidgetBoardProps> = ({
  data,
  onResize = () => {},
}) => {
  const handleResize = (
    currentLayout: Layout[],
    oldItem: Layout,
    newItem: Layout,
    placeholder: Layout,
    event: MouseEvent,
    element: HTMLElement
  ) => {
    onResize(element);
  };

  return (
    <div className="w-full p-0">
      <ResponsiveGridLayout
        className="layout"
        autoSize={true}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={true}
        isResizable={true}
        preventCollision={false}
        containerPadding={[0, 0]}
        resizeHandles={["se", "sw"]}
        draggableHandle=".drag-handle"
        onResize={handleResize}
        width={100}
      >
        {data.map((widget) => (
          <div
            key={widget.layout.i}
            data-grid={widget.layout}
            className="border border-platinum rounded-lg hover:border-primary relative h-full flex flex-col"
          >
            <div className="w-full h-full">{widget.content}</div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default WidgetBoard;
