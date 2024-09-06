import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Protect } from "@clerk/nextjs";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { formatRelative } from 'date-fns';
import {
    FileIcon,
    FileTextIcon,
    GanttChartIcon,
    ImageIcon,
    MoreVertical,
    StarIcon,
    TrashIcon,
    UndoIcon,
} from "lucide-react";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

function FileCardActions({
    file,
    isFavorited,
}: {
    file: Doc<"files">;
    isFavorited: boolean;
}) {
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const { toast } = useToast();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for our deletion process. Files are
                            deleted periodically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                deleteFile({
                                    fileId: file._id,
                                });
                                toast({
                                    variant: "default",
                                    title: "File marked for deletion",
                                    description: "Your file will be deleted soon",
                                });
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        className="flex gap-1 items-center cursor-pointer hover:bg-slate-100"
                        onClick={() => {
                            toggleFavorite({ fileId: file._id });
                        }}
                    >
                        {isFavorited ? (
                            <>
                                <StarIcon className="w-4 h-4" fill="yellow" /> Unfavorite
                            </>
                        ) : (
                            <>
                                <StarIcon className="w-4 h-4" /> Favorite
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex gap-1 items-center cursor-pointer hover:bg-slate-100" onClick={() => {
                        // Open a new tab to file locatrion on convex
                        window.open(getFileUrl(file.fileId), "_blank");
                    }}>
                        <FileIcon className="w-4 h-4" /> Download
                    </DropdownMenuItem>
                    <Protect role="org:admin" fallback={<></>}>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex gap-1 items-center cursor-pointer hover:bg-slate-100"
                            onClick={() => {
                                if (file.shouldDelete) {
                                    restoreFile({
                                        fileId: file._id
                                    })
                                } else {
                                    setIsConfirmOpen(true)
                                }
                            }}
                        >
                            {file.shouldDelete ? (
                                <div>
                                    <UndoIcon className="flex gap-1 text-green-600 items-center cursor-pointer hover:bg-slate-100" />{" "}
                                    Restore
                                </div>
                            ) : (
                                <div className="flex gap-1 text-red-600 items-center cursor-pointer hover:bg-slate-100">
                                    <TrashIcon className="w-4 h-4" />
                                    Delete
                                </div>
                            )}
                        </DropdownMenuItem>
                    </Protect>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

function getFileUrl(fileId: Id<"_storage">): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({
    file,
    favorites,
}: {
    file: Doc<"files">;
    favorites: Doc<"favorites">[];
}) {
    const typeIcons = {
        image: <ImageIcon />,
        pdf: <FileTextIcon />,
        csv: <GanttChartIcon />,
    } as Record<Doc<"files">["type"], ReactNode>;

    const userProfile = useQuery(api.users.getUserProfile, {
        userId: file.userId
    });

    const isFavorited = favorites.some(
        (favorite) => favorite.fileId === file._id
    );
    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2 text-base font-normal">
                    <div className="flex justify-center">{typeIcons[file.type]}</div>
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2">
                    <FileCardActions isFavorited={isFavorited} file={file} />
                </div>
                {/* <CardDescription>Card Description</CardDescription> */}
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
                {file.type === "image" && (
                    <Image
                        alt={file.name}
                        width="200"
                        height="100"
                        src={getFileUrl(file.fileId)}
                    />
                )}
                {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
                {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={userProfile?.image} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {userProfile?.name}
                </div>
                <div className="text-xs text-gray-700">
                    Uploaded {" "}
                    {formatRelative(new Date(file._creationTime), new Date())}
                </div>
            </CardFooter>
        </Card>
    );
}
