"use client"

import AddLearningCenterModal from "@/components/sections/learningCenter/addLearningCenterModal";
import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
import { icons } from "@/constants/icons";
import { API } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

export default function CentersView() {
    const [setisOpenAddLearningCenterModal, setSetisOpenAddLearningCenterModal] = useState(false)

    const { data: learningCenters } = useQuery({
        queryFn: async () => {
            const res = await API.get<ILearningCenters<ILearningCenter>>("/api/v1/super-admin/centers/")

            return res?.data
        },

        queryKey: ["learning-centers"]
    })

    console.log(learningCenters);
    


    return (
        <>
            {setisOpenAddLearningCenterModal ? <AddLearningCenterModal onClose={() => setSetisOpenAddLearningCenterModal(false)} /> : ""}


            <div className="flex items-center justify-between">
                <div className="">
                    <Title text="Learing Center" />
                    <Text text="Dashboard to track student lists, their activity status, and academic results." />
                </div>

                <div className="">
                    <button onClick={() => setSetisOpenAddLearningCenterModal(true)} className="bg-[#4F46E5] cursor-pointer p-[8px_16px] flex items-center gap-[8px] rounded-lg text-white">
                        <Image className="" src={icons.plusIcon} alt="plus-icon" />
                        <span>Add Learing Center</span>
                    </button>
                </div>
            </div>
        </>
    )
}
