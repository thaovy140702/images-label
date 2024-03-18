export interface LabelCoordinates {
    x1: number; 
    y2: number;
}
export interface Element  {
    x1: number; 
    y1: number; 
    x2: number; 
    y2: number;
}

export interface ElementWithId extends Element {
    id: number,
    offsetX: any,
    offsetY: any
}

export interface ElementWithRoughElement extends Element {
    id: number
    roughElement: any;
    label: string;
    color: string;
}