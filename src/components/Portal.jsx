import { createPortal } from 'react-dom';

// Renders children at the document body root, escaping any
// parent stacking context (backdrop-filter, transform, etc.)
// This fixes the z-index issue where modals get trapped behind glass cards.
export default function Portal({ children }) {
  return createPortal(children, document.body);
}
