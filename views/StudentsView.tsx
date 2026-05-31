"use client"

import AddStudentModal from "@/components/sections/sudents/AddStudentModal";
import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
import { icons } from "@/constants/icons";
import { API } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

export default function StudentsView() {
  const [isOpenAddStudentModal, setisOpenAddStudentModal] = useState(false)

  const { data: students, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await API.get<IStudents<IStudent>>("/api/v1/students/")

      return res?.data
    }
  })


  return (
    <>
      {isOpenAddStudentModal ? <AddStudentModal onClose={() => setisOpenAddStudentModal(false)} /> : ""}

      <div>
        <div className="flex items-center justify-between">
          <div className="">
            <Title text="Students" />
            <Text text="Manage and track student enrollment, performance, and status." />
          </div>

          <div className="">
            <button onClick={() => setisOpenAddStudentModal(true)} className="bg-[#4F46E5] cursor-pointer p-[8px_16px] flex items-center gap-[8px] rounded-lg text-white">
              <Image className="" src={icons.plusIcon} alt="plus-icon" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        <div className="">

        </div>
      </div>
    </>
  )
}
