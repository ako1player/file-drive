"use client";
import { columns } from "@/app/dashboard/_components/columns";
import { FileCard } from "@/app/dashboard/_components/file-card";
import { DataTable } from "@/app/dashboard/_components/file-table";
import { SearchBar } from "@/app/dashboard/_components/search-bar";
import UploadButton from "@/app/dashboard/_components/upload-button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { FilterIcon, GridIcon, Loader2, TableIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";


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
    const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

    let orgId: string | undefined = undefined;

    if (organization.isLoaded && user.isLoaded) {
        orgId = organization.organization?.id ?? user.user?.id;
    }

    const favorites = useQuery(api.files.getAllFavorites,
        orgId ? { orgId } : 'skip'
    );
    const files = useQuery(api.files.getFiles, orgId ? { orgId, type: type === 'all' ? undefined : type, query, favorites: favoritesOnly, deletedOnly } : 'skip');
    const isLoading = files === undefined;

    const modifiedFiles = files?.map((file) => ({
        ...file,
        isFavorited: (favorites ?? []).some((favorite) => favorite.fileId === file._id)
    })) ?? [];

    return (
        <div>
            <div className="w-full">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">{title}</h1>
                    <SearchBar query={query} setQuery={setQuery} />
                    <UploadButton />
                </div>

                <Tabs defaultValue="grid">
                    <div className="flex justify-between items-center">
                        <TabsList className="mb-4">
                            <TabsTrigger value="grid" className="flex gap-2 items-center"><GridIcon />Grid</TabsTrigger>
                            <TabsTrigger value="table" className="flex gap-2 items-center"><TableIcon />Table</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <FilterIcon />
                            <Select value={type} onValueChange={(newType) => { setType(newType as any) }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="image">Image</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {isLoading && (
                        <div className="items-center w-full flex flex-col mt-24 gap-8">
                            <Loader2 className="h-24 w-24 animate-spin text-gray-500" />
                            <div>Loading Files...</div>
                        </div>
                    )}
                    <TabsContent value="grid">
                        <div className="grid grid-cols-3 gap-4">
                            {modifiedFiles?.map((file) => {
                                return <FileCard key={file._id} file={file} />;
                            })}
                        </div>
                    </TabsContent>
                    <TabsContent value="table"><DataTable columns={columns} data={modifiedFiles} /></TabsContent>
                </Tabs>

                {files?.length === 0 && (
                    <Placeholder />
                )}
            </div>
        </div>
    );
}
