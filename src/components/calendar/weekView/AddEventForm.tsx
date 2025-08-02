
import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from '@mantine/form';
import { User } from "../Types";
import { DatePickerInput } from '@mantine/dates';
type Props = {

  user:User | undefined
  start:Dayjs
  end:Dayjs
  users: { id: number; name: string }[];
  handleOpenDetailsForm: ()=> void
  
};

export default function AddEvent({ users, user, start, end, handleOpenDetailsForm}: Props) {
  const [newProject, setNewProject] = useState({
    projectleiter: users[0].id,
    mitarbeiter: users[0].id,
    projectName: "",
    color: "#00aaff",
    start: dayjs(),
    end: dayjs().add(1, "hour"),
  });

  const form = useForm({
      mode: 'uncontrolled',
      initialValues: {
        email: '',
        termsOfService: false,
      },

      validate: {
        email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      },
    });

  const date = start.format("MMMM DD, YYYY (HH:mm A") + "-" + end.format("HH:mm A")
  return (
     <form onSubmit={form.onSubmit((values) => console.log(values))}>
      
      <TextInput
        withAsterisk
        label="Project"
        placeholder="Project Name"
        key={form.key('input')}
        {...form.getInputProps('input')}
      />
     
      <small>{date}</small>
   
      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={handleOpenDetailsForm}>More Details</Button>
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
}

