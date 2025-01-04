"use client";

export default function DownloadFile({ fileName }: { fileName: string }) {
  const maxLength = 30;
  const truncatedName = fileName.length > maxLength
    ? (fileName.substring(0, maxLength / 2) + "..." + fileName.substring((fileName.length - (maxLength / 2)), fileName.length))
    : fileName;

  return (
    <div className="flex items-center gap-2 ml-10">
      <a href={`${fileName}`} target="_blank" rel="noopener noreferrer">
        <p className="text-blue-500 underline truncate">
          {truncatedName}
        </p>
      </a>
      <a
        href={`${fileName}`}
        download
        className="text-sm text-black hover:text-gray-700 font-bold"
        title="Download file"
      >
        ⬇️
      </a>
    </div>
  )
}
