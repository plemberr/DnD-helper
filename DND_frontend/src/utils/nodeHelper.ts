import type { FolderNode, TextFileNode, TreeNode } from '../data/library';

const cloneNode = (node: TreeNode): TreeNode =>
  node.kind === 'folder'
    ? {
        ...node,
        children: node.children.map(cloneNode),
      }
    : { ...node };

const cloneTree = (tree: FolderNode[]): FolderNode[] =>
  tree.map((node) => ({
    ...node,
    children: node.children.map(cloneNode),
  }));

const findNodeInChildren = (children: TreeNode[], nodeId: string): TreeNode | null => {
  for (const child of children) {
    if (child.id === nodeId) {
      return child;
    }

    if (child.kind === 'folder') {
      const found = findNodeInChildren(child.children, nodeId);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

const findNodeById = (tree: FolderNode[], nodeId: string): TreeNode | null => {
  for (const node of tree) {
    if (node.id === nodeId) {
      return node;
    }

    const found = findNodeInChildren(node.children, nodeId);
    if (found) {
      return found;
    }
  }

  return null;
};

const findTextFileById = (tree: FolderNode[], documentId: string): TextFileNode | null => {
  const node = findNodeById(tree, documentId);
  return node && node.kind === 'document' ? node : null;
};

const findFirstTextDocumentInChildren = (children: TreeNode[]): TextFileNode | null => {
  for (const child of children) {
    if (child.kind === 'document') {
      return child;
    }

    if (child.kind === 'folder') {
      const found = findFirstTextDocumentInChildren(child.children);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

const findFirstTextDocument = (tree: FolderNode[]): TextFileNode | null => {
  for (const folder of tree) {
    const found = findFirstTextDocumentInChildren(folder.children);
    if (found) {
      return found;
    }
  }

  return null;
};

const containsNode = (folder: FolderNode, searchId: string): boolean =>
  folder.id === searchId || folder.children.some((child) => child.kind === 'folder' && containsNode(child, searchId));

const findDirectParentFolder = (tree: FolderNode[], nodeId: string): FolderNode | null => {
  for (const folder of tree) {
    if (folder.children.some((child) => child.id === nodeId)) {
      return folder;
    }

    for (const child of folder.children) {
      if (child.kind === 'folder') {
        const nested = findDirectParentFolder([child], nodeId);
        if (nested) {
          return nested;
        }
      }
    }
  }

  return null;
};

const removeNodeFromChildren = (children: TreeNode[], nodeId: string): { children: TreeNode[]; removed: TreeNode | null } => {
  let removed: TreeNode | null = null;
  const nextChildren: TreeNode[] = [];

  for (const child of children) {
    if (removed) {
      nextChildren.push(child);
      continue;
    }

    if (child.id === nodeId) {
      removed = child;
      continue;
    }

    if (child.kind === 'folder') {
      const nested = removeNodeFromChildren(child.children, nodeId);
      if (nested.removed) {
        removed = nested.removed;
      }
      nextChildren.push({
        ...child,
        children: nested.children,
      });
      continue;
    }

    nextChildren.push(child);
  }

  return { children: nextChildren, removed };
};

const removeNodeById = (tree: FolderNode[], nodeId: string): { tree: FolderNode[]; removed: TreeNode | null } => {
  let removed: TreeNode | null = null;
  const nextTree: FolderNode[] = [];

  for (const folder of tree) {
    if (removed) {
      nextTree.push(folder);
      continue;
    }

    if (folder.id === nodeId) {
      removed = folder;
      continue;
    }

    const updatedChildren = removeNodeFromChildren(folder.children, nodeId);
    if (updatedChildren.removed) {
      removed = updatedChildren.removed;
    }

    nextTree.push({
      ...folder,
      children: updatedChildren.children,
    });
  }

  return { tree: nextTree, removed };
};

const insertNodeIntoChildren = (
  children: TreeNode[],
  folderId: string,
  nodeToInsert: TreeNode,
  insertIndex: number | null,
): TreeNode[] =>
  children.map((child) => {
    if (child.kind === 'folder') {
      if (child.id === folderId) {
        const nextChildren = [...child.children];
        const index = insertIndex === null ? nextChildren.length : Math.max(0, Math.min(insertIndex, nextChildren.length));
        nextChildren.splice(index, 0, nodeToInsert);
        return { ...child, children: nextChildren };
      }

      return {
        ...child,
        children: insertNodeIntoChildren(child.children, folderId, nodeToInsert, insertIndex),
      };
    }

    return child;
  });

const insertNodeIntoFolder = (
  tree: FolderNode[],
  folderId: string,
  nodeToInsert: TreeNode,
  insertIndex: number | null = null,
): FolderNode[] =>
  tree.map((folder) => {
    if (folder.id === folderId) {
      const nextChildren = [...folder.children];
      const index = insertIndex === null ? nextChildren.length : Math.max(0, Math.min(insertIndex, nextChildren.length));
      nextChildren.splice(index, 0, nodeToInsert);
      return { ...folder, children: nextChildren };
    }

    return {
      ...folder,
      children: insertNodeIntoChildren(folder.children, folderId, nodeToInsert, insertIndex),
    };
  });

const replaceTextDocumentInChildren = (children: TreeNode[], documentId: string, nextDocument: TextFileNode): TreeNode[] =>
  children.map((child) => {
    if (child.id === documentId && child.kind === 'document') {
      return nextDocument;
    }

    if (child.kind === 'folder') {
      return {
        ...child,
        children: replaceTextDocumentInChildren(child.children, documentId, nextDocument),
      };
    }

    return child;
  });

const replaceTextDocument = (tree: FolderNode[], documentId: string, nextDocument: TextFileNode): FolderNode[] =>
  tree.map((folder) => ({
    ...folder,
    children: replaceTextDocumentInChildren(folder.children, documentId, nextDocument),
  }));

export const nodeHelper = {
  cloneNode,
  cloneTree,
  findNodeById,
  findTextFileById,
  findFirstTextDocument,
  containsNode,
  findDirectParentFolder,
  removeNodeById,
  insertNodeIntoFolder,
  replaceTextDocument,
};
