"use client"

import AddDirectorModal from '@/components/sections/director/addDirectorModal'
import Text from '@/components/ui/Text'
import Title from '@/components/ui/Title'
import { icons } from '@/constants/icons'
import { API } from '@/services/api'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { use, useState } from 'react'

export default function DirectorView() {
    const [isOpenAddDirectorModal, setIsOpenAddDirectorModal] = useState(false)


    const { data: Director } = useQuery({
        queryFn: async () => {
            const res = await API.get("/api/v1/super-admin/directors/")

            return res?.data
        },

        queryKey: ["directors"]
    })

    console.log(Director);


    return (
        <>

            {isOpenAddDirectorModal ? <AddDirectorModal onClose={() => setIsOpenAddDirectorModal(false)} /> : ""}

            <div className="flex items-center justify-between">
                <div className="">
                    <Title text="Directors" />
                    <Text text="Dashboard to track student lists, their activity status, and academic results." />
                </div>

                <div className="">
                    <button onClick={() => setIsOpenAddDirectorModal(true)} className="bg-[#4F46E5] cursor-pointer p-[8px_16px] flex items-center gap-[8px] rounded-lg text-white">
                        <Image className="" src={icons.plusIcon} alt="plus-icon" />
                        <span>Add Director</span>
                    </button>
                </div>
            </div>
        </>
    )
}
