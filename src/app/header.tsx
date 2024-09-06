import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export function Header() {
    return <div className="border-b bg-gray-50 py-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex gap-2 items-center text-xl text-black">
                <Image src="/logo.png" width="50" height="50" alt="file drive logo" />
                FileDrive
            </Link>
            <Button variant={"outline"}>
                <Link href={"/dashboard/files"}>Your Files</Link>
            </Button>
            <div className="flex gap-2">
                <OrganizationSwitcher />
                <UserButton />
                <SignedOut>
                    <SignInButton>
                        <Button>Sign In</Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </div>
    </div>
}