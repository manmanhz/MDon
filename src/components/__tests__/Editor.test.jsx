import { render, screen, fireEvent } from '@testing-library/react';
import Editor from '../Editor';
import { describe, it, expect, vi } from 'vitest';

describe('Editor', () => {
  it('should render textarea element', () => {
    render(<Editor content="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('should display initial content', () => {
    const initialContent = '# Hello Monk';
    render(<Editor content={initialContent} onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe(initialContent);
  });

  it('should call onChange when input changes', () => {
    const onChange = vi.fn();
    render(<Editor content="" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'new content' } });

    expect(onChange).toHaveBeenCalledWith('new content');
  });

  it('should have correct placeholder', () => {
    render(<Editor content="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.placeholder).toBe('Start writing Markdown...');
  });

  it('should have editor class', () => {
    render(<Editor content="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('editor');
  });

  it('should disable spellcheck', () => {
    render(<Editor content="" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    // jsdom may return undefined, but attribute should be set
    expect(textarea.getAttribute('spellcheck')).toBe('false');
  });
});
