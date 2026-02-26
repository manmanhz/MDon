import { render, screen } from '@testing-library/react';
import TableOfContents from '../TableOfContents';
import { describe, it, expect } from 'vitest';

describe('TableOfContents', () => {
  it('should render container with toc class', () => {
    render(<TableOfContents headings={[]} />);
    const toc = document.querySelector('.toc');
    expect(toc).toBeInTheDocument();
  });

  it('should render heading list', () => {
    const headings = [
      { level: 1, text: 'Title' },
      { level: 2, text: 'Subtitle' },
    ];
    render(<TableOfContents headings={headings} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('should render h1 with level-1 class', () => {
    const headings = [{ level: 1, text: 'H1 Title' }];
    render(<TableOfContents headings={headings} />);

    const item = screen.getByText('H1 Title');
    expect(item).toHaveClass('level-1');
  });

  it('should render h2 with level-2 class', () => {
    const headings = [{ level: 2, text: 'H2 Title' }];
    render(<TableOfContents headings={headings} />);

    const item = screen.getByText('H2 Title');
    expect(item).toHaveClass('level-2');
  });

  it('should render h3 with level-3 class', () => {
    const headings = [{ level: 3, text: 'H3 Title' }];
    render(<TableOfContents headings={headings} />);

    const item = screen.getByText('H3 Title');
    expect(item).toHaveClass('level-3');
  });

  it('should handle empty headings', () => {
    render(<TableOfContents headings={[]} />);
    const toc = document.querySelector('.toc');
    expect(toc).toBeInTheDocument();
  });

  it('should be clickable', () => {
    const headings = [{ level: 1, text: 'Click Me' }];
    const onClick = vi.fn();
    render(<TableOfContents headings={headings} onClick={onClick} />);

    const item = screen.getByText('Click Me');
    item.click();
    expect(onClick).toHaveBeenCalled();
  });
});
