// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import path from 'path';

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).end('Filename is required');
  }

  const filePath = path.join(process.cwd(), 'public', filename.toString());

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.status(404).end('File not found');
      return;
    }

    // Get the file extension and set the appropriate Content-type
    const fileExtension = path.extname(filePath);
    const contentType = getContentType(fileExtension);

    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', contentType);

    res.end(data);
  });
};

const getContentType = (fileExtension: String) => {
  switch (fileExtension) {
    case '.pdf':
      return 'application/pdf';
    case '.jpg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
};

