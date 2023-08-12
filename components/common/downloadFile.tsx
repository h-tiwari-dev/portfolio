"use client";
import { MouseEvent } from "react";

function handleDownload($event: MouseEvent, file: Buffer, fileName: string) {
    $event.preventDefault();
    const buffer = Buffer.from(file);
    const blob = new Blob([buffer], { type: "application/*" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // Replace with your desired file name
    a.click();
    URL.revokeObjectURL(url);
};

export default function DownloadFile({ file, fileName }: { file: Buffer, fileName: string }) {
    const maxLength = 30;
    return (
        <a href="#" onClick={(e) => handleDownload(e, file as Buffer, fileName)} >
            <p className="truncate ml-10 text-blue-500 underline">
                {fileName.length > maxLength ? (fileName.substring(0, maxLength / 2) + "..." + fileName.substring((fileName.length - (maxLength / 2)), fileName.length)) : fileName}
            </p>
        </a>
    )
}