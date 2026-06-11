import type { Root, Element } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const rehypeFigure: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'img' || index == null || !parent) return;
    if ((parent as Element).tagName === 'figure') return;

    const title = node.properties?.title as string | undefined;
    const figure: Element = {
      type: 'element',
      tagName: 'figure',
      properties: {},
      children: title
        ? [node, { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: title }] }]
        : [node],
    };

    parent.children.splice(index, 1, figure);
  });
};

export default rehypeFigure;
