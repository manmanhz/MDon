import { render, screen } from '@testing-library/react';
import Preview from '../Preview';
import { describe, it, expect } from 'vitest';

describe('Preview', () => {
  it('should render a div with preview class', () => {
    render(<Preview html="<p>test</p>" />);
    const preview = screen.getByText('test');
    expect(preview).toBeInTheDocument();
    expect(preview.parentElement).toHaveClass('preview');
  });

  it('should render HTML content', () => {
    const html = '<h1>Title</h1><p>Paragraph</p>';
    render(<Preview html={html} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Title');

    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });

  it('should handle empty HTML', () => {
    render(<Preview html="" />);
    const preview = document.querySelector('.preview');
    expect(preview).toBeInTheDocument();
  });

  it('should render code blocks', () => {
    const html = '<pre><code>const x = 1;</code></pre>';
    render(<Preview html={html} />);

    const code = screen.getByText('const x = 1;');
    expect(code).toBeInTheDocument();
  });

  it('should render links', () => {
    const html = '<a href="https://example.com">Link</a>';
    render(<Preview html={html} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveTextContent('Link');
  });
});
