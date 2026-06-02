"use client";

import { icons } from "@/constants/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LeftComponent() {
    const pathname = usePathname();

    const navlinks = [
        {
            id: 1,
            href: "/",
            label: "Dashboard",
            icon: icons.dashboardIcon,
        },
        {
            id: 2,
            href: "/directors",
            label: "Directors",
            icon: icons.directorIcon,
        },
        {
            id: 3,
            href: "/centers",
            label: "Learning Centers",
            icon: icons.learningCenterIcon,
        },

        {
            id: 4,
            href: "/payments",
            label: "Financial ",
            icon: icons.paymentsIcon,
        },
        {
            id: 5,
            href: "/settings",
            label: "Settings",
            icon: icons.settingsIcon,
        },
    ];
    return (
        <div className="p-4">
            <div className="flex gap-[12px] mb-[32px] items-center ">
                <span className="w-[40px] h-[40px] text-white bg-[#4F46E5] text-[16px] flex justify-center items-center rounded-lg">
                    EX
                </span>
                <div className="">
                    <p className="text-[24px] font-black text-[#191C1D]">
                        EDU X
                    </p>
                    <p className="text-[#464555] text-[12px] font-bold max-w-[131px] w-full">
                        EDUCATION CENTER
                        CRM
                    </p>
                </div>
            </div>

            <nav className="">
                {navlinks.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <div key={item.id}>
                            <Link
                                href={item.href}
                                className={`
                                ${isActive ? "bg-[#4F46E5] text-white border-l-5 border-[#3525CD]" : "text-[#6C727F] hover:bg-[#F3F4F6]"}
                                flex items-center gap-4 w-full p-[12px_24px] rounded-[0_10px_10px_0] transition-all duration-200 text-[14px] font-medium mb-[4px]
                            `}
                            >
                                <Image
                                    src={item.icon}
                                    alt={item.label}
                                    className={`${isActive ? "invert brightness-0" : ""} w-[20px] h-[20px]`}
                                />
                                <span>{item.label}</span>
                            </Link>
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
