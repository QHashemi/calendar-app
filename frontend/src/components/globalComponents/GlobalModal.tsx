import React from "react";
import { Modal as MantineModal } from "@mantine/core";

type Props = {
  modalContent: React.ReactNode;
  closeModal: () => void;
  isModalOpen: boolean;
  title: string;
  size: string
};

export default function GlobalModal({ modalContent, closeModal, isModalOpen, title , size}: Props) {
  return (
    <MantineModal  transitionProps={{ transition: 'scale' }} opened={isModalOpen} onClose={closeModal} title=    {title} centered size={size} >
      {modalContent}
    </MantineModal>
  );
} 
