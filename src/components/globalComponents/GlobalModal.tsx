
import React from 'react'
import { Modal as MantineModal } from '@mantine/core';

type Props = {
  modalContent: React.ReactNode;
  closeModal:()=>void
  isModalOpen:boolean
  title: string
}


export default function GlobalModal({ modalContent , closeModal, isModalOpen, title}: Props) {
  
  return (
     <>
        <MantineModal opened={isModalOpen} onClose={closeModal} title={title} centered size={"lg"}>
            {modalContent}
        </MantineModal>
      </>
  )
}

