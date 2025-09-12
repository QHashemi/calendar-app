// DeleteButton.tsx
import { ActionIcon, Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Trash } from "lucide-react";

type Props = {
  size: string;
  title: string;
  buttonTitle: string;
  deleteText: string;
  onConfirm: () => void;
  isButton: boolean;
};

function DeleteButton({ size, title, buttonTitle, deleteText, onConfirm, isButton }: Props) {
  const openDeleteModal = () =>
    modals.openConfirmModal({
      title,
      centered: true,
      children: <Text size="sm">{deleteText}</Text>,
      labels: { 
        confirm: buttonTitle || "Löschen", 
        cancel: "Abbrechen" 
      },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Abgebrochen"),
      onConfirm,
    });

  return isButton ? (
    <Button 
      size={size} 
      variant="outline" 
      onClick={openDeleteModal} 
      color="red" 
      onPointerDown={(e) => e.stopPropagation()}
    >
      {buttonTitle || "Löschen"}
    </Button>
  ) : (
    <ActionIcon variant="light" color="red">
      <Trash size={15} onClick={openDeleteModal} />
    </ActionIcon>
  );
}

export default DeleteButton;
