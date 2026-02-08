export default function KeystaticPage() {
  return null;
}

export function generateStaticParams() {
  // Generate the base /keystatic route
  // The actual Keystatic UI is rendered by the layout as a client component
  return [{ params: undefined }];
}
