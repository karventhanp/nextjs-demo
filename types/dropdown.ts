interface BaseDropDownProps {
  show: boolean;
  setShow: (value: boolean) => void;
  options: string[];
  onChange: (value: string) => void;
  left?: number;
  right?: number;
  full?: boolean;
}

interface DropDownWithImages extends BaseDropDownProps {
    labelWithImage: true;
    images: string[];
    actions: string[];
}

interface DropDownWithoutImages extends BaseDropDownProps {
    labelWithImage?: false;
    images?: never;
    actions?: never;
}

export type DropDownProps = DropDownWithImages | DropDownWithoutImages ;