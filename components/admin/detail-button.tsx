"use client";

import React, { useState } from "react";
import { Icons } from "@/components/ui/icons";
import { DetailModal } from "./detail-modal";

interface DetailButtonProps {
    title: string;
    data: any;
}

export function DetailButton({ title, data }: DetailButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-gray-400 hover:text-blue-600 icon-btn"
                title="View Details"
            >
                <Icons.Eye className="h-4 w-4" />
            </button>
            <DetailModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
                data={data}
            />
        </>
    );
}
