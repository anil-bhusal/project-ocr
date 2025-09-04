export interface OCRWord {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
  wordId: number;
  lineId: number;
  confidence?: number;
}

export interface OCRLine {
  lineId: number;
  words: OCRWord[];
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
}

export interface DetectedField {
  fieldType: 'invoice_number' | 'date' | 'amount' | 'customer_name' | 'total' | 'subtotal' | 'tax' | 'due_date' | 'unknown';
  value: string;
  confidence: number;
  words: OCRWord[];
  coordinates: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export interface EnhancedOCRResponse {
  words: OCRWord[];
}

export interface WordSelection {
  wordIds: Set<number>;
  selectedWords: OCRWord[];
  selectedText: string;
}

export interface DragSelection {
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragCurrent: { x: number; y: number } | null;
  selectionBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
}

export interface EnhancedSelection {
  words: WordSelection;
  drag: DragSelection;
  mode: 'click' | 'drag' | 'line';
}

export interface FieldVisualization {
  field: DetectedField;
  color: string;
  isVisible: boolean;
  isHighlighted: boolean;
}