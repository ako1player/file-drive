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
import {
    FileIcon,
    MoreVertical,
    StarIcon,
    TrashIcon,
    UndoIcon
} from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

export function FileCardActions({
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
    const me = useQuery(api.users.getMe)
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
                    <Protect condition={(check) => {
                        return check({
                            role: "org:admin"
                        }) || file.userId === me?._id;
                    }} fallback={<></>}>
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