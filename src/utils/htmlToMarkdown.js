// Simple HTML to Markdown converter for TipTap content
export function htmlToMarkdown(html) {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  let markdown = '';
  const processNode = (node, listStack = []) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();

      switch (tag) {
        case 'h1':
          return `# ${node.textContent}\n\n`;
        case 'h2':
          return `## ${node.textContent}\n\n`;
        case 'h3':
          return `### ${node.textContent}\n\n`;
        case 'h4':
          return `#### ${node.textContent}\n\n`;
        case 'h5':
          return `##### ${node.textContent}\n\n`;
        case 'h6':
          return `###### ${node.textContent}\n\n`;
        case 'p':
          return `${node.textContent}\n\n`;
        case 'br':
          return '\n';
        case 'strong':
        case 'b':
          return `**${node.textContent}**`;
        case 'em':
        case 'i':
          return `*${node.textContent}*`;
        case 'code':
          return `\`${node.textContent}\``;
        case 'pre':
          return `\`\`\`\n${node.textContent}\n\`\`\`\n\n`;
        case 'blockquote':
          return `> ${node.textContent}\n\n`;
        case 'ul':
          return Array.from(node.children).map(li => `- ${li.textContent}`).join('\n') + '\n\n';
        case 'ol':
          return Array.from(node.children).map((li, i) => `${i + 1}. ${li.textContent}`).join('\n') + '\n\n';
        case 'li':
          return node.textContent;
        case 'a':
          return `[${node.textContent}](${node.getAttribute('href') || ''})`;
        case 'hr':
          return '---\n\n';
        case 'div':
        case 'section':
        case 'article':
          return Array.from(node.childNodes).map(child => processNode(child, listStack)).join('');
        default:
          return node.textContent;
      }
    }
    return '';
  };

  // Process all top-level elements
  const body = doc.body;
  Array.from(body.childNodes).forEach(node => {
    markdown += processNode(node);
  });

  // Clean up multiple newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  return markdown.trim();
}
