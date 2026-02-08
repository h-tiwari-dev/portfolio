export async function onRequestGet(context: {
  env: { ASSETS: any };
  params: { filename: string };
}) {
  const { env, params } = context;
  const filename = params.filename;

  if (!filename) {
    return new Response('Filename is required', { status: 400 });
  }

  const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
  const contentType = getContentType(fileExtension);

  try {
    const response = await env.ASSETS.fetch(
      new URL(`/${filename}`, 'https://example.com')
    );
    if (!response.ok) {
      return new Response('File not found', { status: 404 });
    }
    const fileContent = await response.arrayBuffer();

    return new Response(fileContent, {
      headers: {
        'Content-disposition': `attachment; filename=${filename}`,
        'Content-type': contentType,
      },
    });
  } catch {
    return new Response('File not found', { status: 404 });
  }
}

function getContentType(fileExtension: string): string {
  switch (fileExtension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}
