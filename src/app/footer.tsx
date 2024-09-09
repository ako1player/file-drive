import Link from "next/link";

export function Footer() {
    return <div className="h-40 bg-gray-100 mt-12 flex items-center">
        <div className="container mx-auto flex justify-between items-center">
            <div>FileDrive</div>
            <Link href={""}>Privacy</Link>
            <Link href={""}>Terms of Service</Link>
            <Link href={""}>About</Link>
        </div>
    </div>
} 