// DeleteButton.tsx
import { ActionIcon, Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Trash } from "lucide-react";

type Props = {
  size: string;
  title: string;
  buttonTitle: string;
  deleteText: string;
  onConfirm: () => void; // <-- instead of handleDeleteAction(id:number)
  isButton: boolean;

};

function DeleteButton({ size, title, buttonTitle, deleteText, onConfirm, isButton }: Props) {
  const openDeleteModal = () =>
    modals.openConfirmModal({
      title,
      centered: true,

      children: <Text size="sm">{deleteText}</Text>,
      labels: { confirm: buttonTitle, cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm,

    });

  return isButton ? (
    <Button size={size} variant="outline" onClick={openDeleteModal} color="red" onPointerDown={(e) => e.stopPropagation()}
>
      Delete
    </Button>
  ) : (
    <ActionIcon variant="light" color="red">
      <Trash size={15} onClick={openDeleteModal} />
    </ActionIcon>
  );
}

export default DeleteButton;
