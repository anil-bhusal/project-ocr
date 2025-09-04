import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/dom';
import { FileUploadSection } from '../FileUploadSection';

describe('FileUploadSection', () => {
  let onDragOver: ReturnType<typeof vi.fn>;
  let onDragLeave: ReturnType<typeof vi.fn>;
  let onDrop: ReturnType<typeof vi.fn>;
  let onFileChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onDragOver = vi.fn();
    onDragLeave = vi.fn();
    onDrop = vi.fn();
    onFileChange = vi.fn();

    render(
      <FileUploadSection
        isDragOver={false}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onFileChange={onFileChange}
      />
    );
  });

  it('renders correctly', () => {
    expect(screen.getByText(/Upload Document for OCR/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop an image file/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose File/i)).toBeInTheDocument();
  });

  it('calls onDragOver when dragging over the container', () => {
    const container = screen.getByText(/Upload Document for OCR/i).parentElement!;
    fireEvent.dragOver(container);
    expect(onDragOver).toHaveBeenCalled();
  });

  it('calls onDragLeave when leaving the container', () => {
    const container = screen.getByText(/Upload Document for OCR/i).parentElement!;
    fireEvent.dragLeave(container);
    expect(onDragLeave).toHaveBeenCalled();
  });

  it('calls onDrop when a file is dropped', () => {
    const container = screen.getByText(/Upload Document for OCR/i).parentElement!;
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.drop(container, {
      dataTransfer: { files: [file] },
    });

    expect(onDrop).toHaveBeenCalled();
  });

  it('triggers file input click when container is clicked', () => {
    const container = screen.getByText(/Upload Document for OCR/i).parentElement!;
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

    const clickSpy = vi.spyOn(fileInput, 'click');

    container.click();

    expect(clickSpy).toHaveBeenCalled();
  });


  it('calls onFileChange when a file is selected', async () => {
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['dummy'], 'example.png', { type: 'image/png' });

    await userEvent.upload(fileInput, file);

    expect(fileInput.files?.[0]).toStrictEqual(file);
    expect(fileInput.files).toHaveLength(1);
  });


  it('renders drag-over state correctly', () => {
    render(
      <FileUploadSection
        isDragOver={true}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onFileChange={onFileChange}
      />
    );

    expect(screen.getByText(/Drop your image here/i)).toBeInTheDocument();
  });
});
