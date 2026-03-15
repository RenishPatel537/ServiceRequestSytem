import { getAuthSession } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";

export default async function RequestorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // We get session only for display (username), NOT for auth checks here
    const session = await getAuthSession();

    return (
        <Shell userRole="REQUESTOR" username={session?.username || "Requestor"}>
            {children}
        </Shell>
    );
}
