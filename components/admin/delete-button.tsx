"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";

interface DeleteButtonProps {
    id: number;
    apiPath: string;
}

export function DeleteButton({ id, apiPath }: DeleteButtonProps) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`${apiPath}?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to delete");
                return;
            }

            router.refresh();
        } catch (error) {
            console.error("Delete error:", error);
            alert("An unexpected error occurred");
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-900"
            title="Delete"
        >
            <Icons.Trash className="h-4 w-4" />
        </button>
    );
}
