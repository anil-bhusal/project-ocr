import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadStatusBar } from '../UploadStatusBar';

describe('UploadStatusBar', () => {
  let onUploadNew: ReturnType<typeof vi.fn>;
  let onClearSelection: ReturnType<typeof vi.fn>;
  let onFileChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onUploadNew = vi.fn();
    onClearSelection = vi.fn();
    onFileChange = vi.fn();
  });

  it('renders success message and buttons correctly', () => {
    render(
      <UploadStatusBar
        isProcessing={false}
        hasOcrData={true}
        onUploadNew={onUploadNew}
        onClearSelection={onClearSelection}
        onFileChange={onFileChange}
      />
    );

    expect(screen.getByText(/Document uploaded successfully/i)).toBeTruthy();
    expect(screen.getByText(/Upload New/i)).toBeTruthy();
    expect(screen.getByText(/Clear Word\(s\) Selection/i)).toBeTruthy();
  });

  it('does not show clear selection button if hasOcrData is false', () => {
    render(
      <UploadStatusBar
        isProcessing={false}
        hasOcrData={false}
        onUploadNew={onUploadNew}
        onClearSelection={onClearSelection}
        onFileChange={onFileChange}
      />
    );

    expect(screen.queryByText(/Clear Word\(s\) Selection/i)).toBeNull();
  });

  it('shows processing bar when isProcessing is true', () => {
    render(
      <UploadStatusBar
        isProcessing={true}
        hasOcrData={false}
        onUploadNew={onUploadNew}
        onClearSelection={onClearSelection}
        onFileChange={onFileChange}
      />
    );

    expect(screen.getByText(/Processing OCR/i)).toBeTruthy();
  });

  it('calls onUploadNew when Upload New button is clicked', async () => {
    render(
      <UploadStatusBar
        isProcessing={false}
        hasOcrData={false}
        onUploadNew={onUploadNew}
        onClearSelection={onClearSelection}
        onFileChange={onFileChange}
      />
    );

    const button = screen.getByText(/Upload New/i);
    await userEvent.click(button);
    expect(onUploadNew).toHaveBeenCalled();
  });

  it('calls onClearSelection when Clear Word(s) Selection button is clicked', async () => {
    render(
      <UploadStatusBar
        isProcessing={false}
        hasOcrData={true}
        onUploadNew={onUploadNew}
        onClearSelection={onClearSelection}
        onFileChange={onFileChange}
      />
    );

    const button = screen.getByText(/Clear Word\(s\) Selection/i);
    await userEvent.click(button);
    expect(onClearSelection).toHaveBeenCalled();
  });

  it('calls onFileChange when file input changes', () => {
    render(
      <UploadStatusBar
        isProcessing={false}
        hasOcrData={true}
        onUploadNew={onUploadNew}
        onClearSelection={onClearSelection}
        onFileChange={onFileChange}
      />
    );

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileChange).toHaveBeenCalled();
    expect(onFileChange.mock.calls[0][0].target.files![0]).toBe(file);
  });
});
