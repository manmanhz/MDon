import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TabBar from '../TabBar';

describe('TabBar', () => {
  const mockFiles = [
    { id: '1', name: 'file1.md', isModified: false },
    { id: '2', name: 'file2.md', isModified: true }
  ];

  it('renders all tabs', () => {
    render(<TabBar files={mockFiles} activeFileId="1" onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByText('file1.md')).toBeInTheDocument();
    expect(screen.getByText('file2.md')).toBeInTheDocument();
  });

  it('calls onSelect when tab clicked', () => {
    const onSelect = vi.fn();
    render(<TabBar files={mockFiles} activeFileId="1" onSelect={onSelect} onClose={() => {}} />);
    fireEvent.click(screen.getByText('file2.md'));
    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<TabBar files={mockFiles} activeFileId="1" onSelect={() => {}} onClose={onClose} />);
    fireEvent.click(screen.getAllByText('×')[0]);
    expect(onClose).toHaveBeenCalledWith('1');
  });
});
