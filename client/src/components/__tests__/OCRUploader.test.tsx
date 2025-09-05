import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import type { Mock } from 'vitest';
import { render, waitFor } from '../../test/test-utils';
import { screen, fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import OCRUploader from '../OCRUploader';
import { useOCRSelection } from '../../hooks/useOCRSelection';
import { useMouseSelection } from '../../hooks/useMouseSelection';
import { useOCRMutation } from '../../hooks/useOCRQuery';
import { useZoomHandlers } from '../../hooks/useZoomHandlers';

vi.mock('../../hooks/useOCRQuery');
vi.mock('../../hooks/useOCRSelection');
vi.mock('../../hooks/useMouseSelection');
vi.mock('../../hooks/useZoomHandlers');

// At the top of your test file, before describe()
beforeAll(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'mocked-url');
});

afterAll(() => {
  vi.restoreAllMocks();
});


// Mock child components
vi.mock('../OCR/FileUploadSection', () => ({
  FileUploadSection: ({ onFileChange, onDragOver, onDragLeave, onDrop }: { onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onDragOver: (e: React.DragEvent) => void; onDragLeave: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void }) => (
    <div
      data-testid="dropzone"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input data-testid="file-input" type="file" onChange={onFileChange} />
    </div>
  ),
}));

vi.mock('../OCR/UploadStatusBar', () => ({
  UploadStatusBar: ({ onUploadNew }: { onUploadNew: () => void }) => (
    <button data-testid="upload-new" onClick={onUploadNew}>
      Upload New
    </button>
  ),
}));
vi.mock('../OCR/ImageViewer', () => ({
  ImageViewer: () => <div data-testid="image-viewer">ImageViewer</div>,
}));
vi.mock('../OCR/TextPanel', () => ({
  TextPanel: () => <div data-testid="text-panel">TextPanel</div>,
}));
vi.mock('../LoadingFallback', () => ({
  LoadingFallback: () => <div data-testid="loading">Loading...</div>,
}));

describe('OCRUploader', () => {
  let mockMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMutate = vi.fn();

    (useOCRMutation as unknown as Mock).mockReturnValue({
      mutate: mockMutate,
    });

    (useOCRSelection as unknown as Mock).mockReturnValue({
      wordSelection: { wordIds: new Set(), selectedWords: [], selectedText: '' },
      setWordSelection: vi.fn(),
      updateWordSelection: vi.fn(),
      clearSelection: vi.fn(),
      getWordsBetween: vi.fn(),
    });

    (useMouseSelection as unknown as Mock).mockReturnValue({
      handleMouseDown: vi.fn(),
    });

    (useZoomHandlers as unknown as Mock).mockReturnValue({
      handleZoomIn: vi.fn(),
      handleZoomOut: vi.fn(),
      handleZoomReset: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders FileUploadSection when no image is uploaded', () => {
    render(<OCRUploader />);
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('handles file upload and triggers OCR mutation', async () => {
    render(<OCRUploader />);
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ file });
    });
  });

  it('shows UploadStatusBar after file upload and OCR success', async () => {
    const { act } = await import('@testing-library/react');
    
    render(<OCRUploader />);
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);

    // simulate OCR success
    await act(async () => {
      const onSuccess = (useOCRMutation as unknown as Mock).mock.calls[0]?.[0]?.onSuccess;
      onSuccess({ words: [] });
    });

    await waitFor(() => {
      expect(screen.getByTestId('upload-new')).toBeInTheDocument();
    });
  });

  it('shows error alert when OCR fails', async () => {
    const { act } = await import('@testing-library/react');
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<OCRUploader />);
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

    const file = new File(['dummy'], 'bad.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);

    // simulate OCR error
    await act(async () => {
      const onError = (useOCRMutation as unknown as Mock).mock.calls[0]?.[0]?.onError;
      onError(new Error('OCR failed'));
    });

    expect(alertSpy).toHaveBeenCalledWith('OCR processing failed');
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

it('handles drag and drop of an image file', async () => {
  render(<OCRUploader />);

  const dropzone = screen.getByTestId('dropzone');
  const file = new File(['dummy'], 'drop.png', { type: 'image/png' });

  const dataTransfer = {
    files: [file],
    items: [],
    types: ['Files'],
  };

  fireEvent.dragOver(dropzone, { dataTransfer });
  fireEvent.drop(dropzone, { dataTransfer });

  await waitFor(() => {
    expect(mockMutate).toHaveBeenCalledWith({ file });
  });
});


  it('renders ImageViewer and TextPanel after OCR data is loaded', async () => {
    const { act } = await import('@testing-library/react');
    
    render(<OCRUploader />);
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    await userEvent.upload(fileInput, file);

    // simulate OCR success with words
    await act(async () => {
      const onSuccess = (useOCRMutation as unknown as Mock).mock.calls[0]?.[0]?.onSuccess;
      onSuccess({
        words: [
          { wordId: 1, text: 'hello', top: 0, left: 0, width: 10, height: 10, lineId: 1 },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('image-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('text-panel')).toBeInTheDocument();
    });
  });
});
