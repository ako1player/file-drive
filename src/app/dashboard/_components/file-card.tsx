import { FileCardActions } from "@/app/dashboard/_components/file-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useQuery } from "convex/react";
import { formatRelative } from 'date-fns';
import {
    FileTextIcon,
    GanttChartIcon,
    ImageIcon
} from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

function getFileUrl(fileId: Id<"_storage">): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({
    file,
}: {
    file: Doc<"files"> & { isFavorited: boolean };
}) {
    const typeIcons = {
        image: <ImageIcon />,
        pdf: <FileTextIcon />,
        csv: <GanttChartIcon />,
    } as Record<Doc<"files">["type"], ReactNode>;

    const userProfile = useQuery(api.users.getUserProfile, {
        userId: file.userId
    });

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2 text-base font-normal">
                    <div className="flex justify-center">{typeIcons[file.type]}</div>
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2">
                    <FileCardActions isFavorited={file.isFavorited} file={file} />
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
