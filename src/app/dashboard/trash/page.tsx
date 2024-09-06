"use client"

import { FileBrowser } from "@/app/dashboard/_components/file-browser";

export default function TrashPage() {
    return <div>
        <FileBrowser title={"Trash"} deletedOnly />
    </div>
}