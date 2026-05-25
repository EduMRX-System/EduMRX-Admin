import { icons } from "@/constants/icons";
import Image from "next/image";

export default function Header() {
    return (
        <header>
            <div className="p-[24px_12px] flex justify-between items-center">
                <div className="border border-[#C7C4D8] rounded-lg max-w-[380px] gap-[10px] p-[0_0_0_12px] w-full flex items-center h-[40px]">
                    <Image src={icons.searchIcon} alt="search-icon" />
                    <input type="text" placeholder="Search students, courses..." className="outline-none text-[#6B7280]" />
                </div>

                <div className="flex items-center gap-[15px]">
                    <div className="text-[14px] text-[#464555]">Role</div>
                    <div className="w-[32px] h-[32px] bg-gray-400 rounded-full"></div>
                </div>
            </div>
        </header>
    )
}
