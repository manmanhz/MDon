import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileSidebar from '../FileSidebar';

const mockTree = [
  { name: 'folder1', path: '/test/folder1', type: 'folder', children: [
    { name: 'file1.md', path: '/test/folder1/file1.md', type: 'file' }
  ]},
  { name: 'file2.md', path: '/test/file2.md', type: 'file' }
];

describe('FileSidebar', () => {
  it('renders folder tree', () => {
    render(<FileSidebar tree={mockTree} onFileClick={() => {}} onFileDoubleClick={() => {}} />);
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('file2.md')).toBeInTheDocument();
    // Expand folder to see children
    fireEvent.click(screen.getByText('folder1'));
    expect(screen.getByText('file1.md')).toBeInTheDocument();
  });

  it('calls onFileClick when file single clicked', () => {
    const onFileClick = vi.fn();
    render(<FileSidebar tree={mockTree} onFileClick={onFileClick} onFileDoubleClick={() => {}} />);
    fireEvent.click(screen.getByText('file2.md'));
    expect(onFileClick).toHaveBeenCalledWith('/test/file2.md');
  });

  it('calls onFileDoubleClick when file Command+clicked', () => {
    const onFileDoubleClick = vi.fn();
    render(<FileSidebar tree={mockTree} onFileClick={() => {}} onFileDoubleClick={onFileDoubleClick} />);
    fireEvent.click(screen.getByText('file2.md'), { metaKey: true });
    expect(onFileDoubleClick).toHaveBeenCalledWith('/test/file2.md');
  });
});
