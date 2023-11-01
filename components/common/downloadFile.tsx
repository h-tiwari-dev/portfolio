"use client";

export default function DownloadFile({ fileName }: { fileName: string }) {
    const maxLength = 30;
    return (
        <a href={`/api/downloadFile?filename=${fileName}`}>
            <p className="truncate ml-10 text-blue-500 underline">
                {fileName.length > maxLength ? (fileName.substring(0, maxLength / 2) + "..." + fileName.substring((fileName.length - (maxLength / 2)), fileName.length)) : fileName}
            </p>
        </a>
    )
}