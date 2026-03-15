import { getAuthSession } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getAuthSession();

    return (
        <Shell userRole="ADMIN" username={session?.username || "Admin"}>
            {children}
        </Shell>
    );
}
