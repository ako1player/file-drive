"use client";
import { FileCard } from "@/app/dashboard/_components/file-card";
import { SearchBar } from "@/app/dashboard/_components/search-bar";
import UploadButton from "@/app/dashboard/_components/upload-button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";

function Placeholder() {
    return <div className="flex flex-col gap-8 w-full items-center mt-24">
        <Image alt="image of a picture and directory icon" width={300} height={300} src="/empty.svg" />
        <div className="text-2xl">You have no files, upload one now</div>
        <UploadButton />
    </div>
}

export function FileBrowser({ title, favoritesOnly, deletedOnly }: { title: string, favoritesOnly?: boolean, deletedOnly?: boolean }) {
    const organization = useOrganization();
    const user = useUser();
    const [query, setQuery] = useState("");

    let orgId: string | undefined = undefined;

    if (organization.isLoaded && user.isLoaded) {
        orgId = organization.organization?.id ?? user.user?.id;
    }

    const favorites = useQuery(api.files.getAllFavorites,
        orgId ? { orgId } : 'skip'
    );
    const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites: favoritesOnly, deletedOnly } : 'skip');
    const isLoading = files === undefined;
    return (
        <div>
            {isLoading && (
                <div className="items-center w-full flex flex-col mt-24 gap-8">
                    <Loader2 className="h-24 w-24 animate-spin text-gray-500" />
                    <div>Loading images...</div>
                </div>
            )}

            <div className="w-full">
                {!isLoading && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-bold">{title}</h1>
                            <SearchBar query={query} setQuery={setQuery} />
                            <UploadButton />
                        </div>
                        {files?.length === 0 && (
                            <Placeholder />
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            {files?.map((file) => {
                                return <FileCard favorites={favorites ?? []} key={file._id} file={file} />;
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
