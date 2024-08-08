import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu"
import { useMutation } from "convex/react"
import { FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, TrashIcon } from "lucide-react"
import Image from "next/image"
import { ReactNode, useState } from "react"
import { api } from "../../convex/_generated/api"
import { Doc, Id } from "../../convex/_generated/dataModel"


function FileCardActions({ file }: { file: Doc<"files"> }) {
    const deleteFile = useMutation(api.files.deleteFile)
    const { toast } = useToast();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            deleteFile({
                                fileId: file._id
                            })
                            toast({
                                variant: "default",
                                title: "File Deleted",
                                description: "Your file has been deleted"
                            })
                        }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem className="flex gap-1 text-red-600 items-center cursor-pointer" onClick={() => setIsConfirmOpen(true)}><TrashIcon className="w-4 h-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

function getFileUrl(fileId: Id<"_storage">): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({ file }: { file: Doc<"files"> }) {

    const typeIcons = {
        "image": <ImageIcon />,
        "pdf": <FileTextIcon />,
        "csv": <GanttChartIcon />
    } as Record<Doc<"files">["type"], ReactNode>;

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2">
                    <div className="flex justify-center">{typeIcons[file.type]}</div>
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2">
                    <FileCardActions file={file} />
                </div>
                {/* <CardDescription>Card Description</CardDescription> */}
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center">
                {file.type === "image" && (
                    <Image alt={file.name} width="200" height="100" src={getFileUrl(file.fileId)} />
                )}
                {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
                {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button onClick={() => {
                    // Open a new tab to file locatrion on convex
                    window.open(getFileUrl(file.fileId), "_blank")
                }}>Download</Button>
            </CardFooter>
        </Card>

    )
}