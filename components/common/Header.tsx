import { icons } from "@/constants/icons";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    const { user } = useAuthStore()


    return (
        <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100">
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex justify-end items-center">


                <Link href="/settings" className="flex items-center gap-6">

                    {/* User Info */}
                    <div className="text-right">
                        <p className="text-[12px] font-medium text-slate-900 leading-none">
                            {user?.full_name || "User Name"}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                            {user?.role || "Admin"}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                        {user?.avatar ? (
                            <Image
                                src={user.avatar}
                                alt="avatar"
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-bold text-slate-600">
                                {user?.full_name?.charAt(0).toUpperCase() || "A"}
                            </span>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    )
}
