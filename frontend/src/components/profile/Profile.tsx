"use client";
import React, { useRef, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Textarea,
  ColorInput,
  Select,
  Button,
  Grid,
  Stack,
  Group,
  Divider,
  Flex,
  Box,
  Avatar,
  ActionIcon,
  Title,
  Text,
  MultiSelect,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/Api/store";
import {
  resetUserComponentType,
  selectUsersState,
  update_profile_image,
  update_user,
} from "@/Api/slices/User";
import useAxiosPrivate from "@/Api/useAxiosPrivate";
import {
  refresh_account,
  selectCredentialState,
} from "@/Api/slices/CredentialsSlice";
import PasswordMGT from "./PasswordMGT";
import { uploadsUrl } from "@config/coreConfig";
import { get_roles, selectRoles } from "@/Api/slices/RoleSlice";
import { get_permissions } from "@/Api/slices/PermissionSlice";
import profileBackground from "@assets/images/profile-background-01.png";
import { notifyMessage } from "@/helpers/notifyMessage";

export default function ProfileForm() {
  const Gender = {
    MALE: "männlich",
    FEMALE: "weiblich",
    OTHER: "andere",
  };

  const dispatch = useDispatch<AppDispatch>();
  const axiosInstance = useAxiosPrivate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const roles = useSelector(selectRoles);
  const { user, accessToken } = useSelector(selectCredentialState);
  const { msg, componentType, error } = useSelector(selectUsersState);

  useEffect(() => {
    if (accessToken) {
      dispatch(get_roles({ axiosInstance, componentType: "get_roles" }));
      dispatch(
        get_permissions({ axiosInstance, componentType: "get_permission" })
      );
    }
  }, [dispatch, axiosInstance, accessToken]);

  const form = useForm({
    initialValues: {
      title: "",
      first_name: "",
      last_name: "",
      display_name: "",
      email: "",
      gender: Gender.MALE,
      job: "",
      color: "",
      roles: user.roles?.map((role) => String(role.id)) || [],
      phone: "",
      mobile_phone: "",
      website: "",
      description: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        title: user.title || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        display_name: `${user.first_name} ${user.last_name}` || "",
        email: user.email || "",
        gender: user.gender || Gender.MALE,
        job: user.job || "",
        color: user.color || "",
        roles: user.roles?.map((role) => String(role.id)) || [],
        phone: user.phone || "",
        mobile_phone: user.mobile_phone || "",
        website: user.website || "",
        description: user.description || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (componentType !== "update_profile_image") return;
    notifyMessage({
      msg,
      error: !!error,
      componentType,
      expectedComponentType: "update_profile_image",
    });
    dispatch(resetUserComponentType(""));
  }, [msg, error, componentType]);

  const handleProfileImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.[0] || !user) return;
    const formData = new FormData();
    formData.append("image", event.target.files[0]);

    try {
      await dispatch(
        update_profile_image({
          axiosInstance,
          value: { formData, userId: user.id },
          componentType: "update_profile_image",
        })
      ).unwrap();
      await dispatch(
        refresh_account({ axiosInstance, componentType: "refresh_account" })
      ).unwrap();
    } catch (error) {
      console.error("Fehler beim Hochladen des Profilbildes", error);
    }
  };

  useEffect(() => {
    if (componentType !== "update_user_profile_form") return;
    notifyMessage({
      msg,
      error: !!error,
      componentType,
      expectedComponentType: "update_user_profile_form",
    });
    dispatch(resetUserComponentType(""));
  }, [msg, error, componentType]);

  const handleUpdateProfile = async (values: typeof form.values) => {
    if (!user) return;
    try {
      await dispatch(
        update_user({
          axiosInstance,
          value: values,
          id: user.id,
          componentType: "update_user_profile_form",
        })
      ).unwrap();
      await dispatch(
        refresh_account({ axiosInstance, componentType: "refresh_account" })
      ).unwrap();
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Profils", error);
    }
  };

  return (
    <div>
      {/* Header */}
      <Box
        style={{
          height: 250,
          backgroundImage: `url(${profileBackground.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 40,
          color: "white",
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <Avatar
            src={user?.image ? `${uploadsUrl}${user.image}` : undefined}
            color={user.color}
            alt="Profilbild"
            radius="50%"
            size={100}
            name={user.display_name}
          />
          <ActionIcon
            variant="filled"
            color="blue"
            radius="4"
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              transform: "translate(25%, 25%)",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <IconEdit size={15} />
          </ActionIcon>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleProfileImageChange}
        />
        <Title>{user?.display_name}</Title>
        <Text>{user?.job}</Text>
      </Box>

      {/* Formular */}
      <Flex gap="lg" wrap="wrap" style={{ marginTop: 50 }}>
        {/* Passwort Verwaltung */}
        <Stack
          style={{
            flex: 1,
            minWidth: 250,
            borderRight: "1px solid lightGray",
            padding: "10px 20px",
          }}
        >
          <PasswordMGT userId={user.id} />
        </Stack>

        {/* Profilinformationen */}
        <Stack style={{ flex: 2, minWidth: 400, padding: "10px 20px" }}>
          <form onSubmit={form.onSubmit(handleUpdateProfile)}>
            <Title order={3}>Profilinformationen ändern</Title>
            <Grid>
              <Grid.Col span={6}>
                <TextInput label="Vorname" {...form.getInputProps("first_name")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Nachname" {...form.getInputProps("last_name")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Anzeigename" {...form.getInputProps("display_name")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Titel" {...form.getInputProps("title")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Beruf" {...form.getInputProps("job")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Geschlecht"
                  placeholder="Wählen Sie ein Geschlecht"
                  data={[
                    { value: Gender.MALE, label: "Männlich" },
                    { value: Gender.FEMALE, label: "Weiblich" },
                    { value: Gender.OTHER, label: "Andere" },
                  ]}
                  {...form.getInputProps("gender")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <ColorInput label="Lieblingsfarbe" {...form.getInputProps("color")} />
              </Grid.Col>

              <Grid.Col span={6}>
                {user?.roles?.some((role) => role.name === "superadmin") ? (
                  <MultiSelect
                    label="Rollen"
                    data={roles.map((role) => ({ value: String(role.id), label: role.name })) || []}
                    {...form.getInputProps("roles")}
                    placeholder="Rollen auswählen"
                  />
                ) : (
                  <TextInput
                    label="Rollen"
                    value={user?.roles?.map((role) => role.name).join(", ") || ""}
                    disabled
                  />
                )}
              </Grid.Col>
            </Grid>

            <Divider my="sm" />

            <Grid>
              <Grid.Col span={6}>
                <TextInput label="E-Mail" {...form.getInputProps("email")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Website" {...form.getInputProps("website")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Telefon" {...form.getInputProps("phone")} />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput label="Mobiltelefon" {...form.getInputProps("mobile_phone")} />
              </Grid.Col>
            </Grid>

            <Divider my="sm" />

            <Textarea
              label="Bio"
              minRows={4}
              maxRows={10}
              {...form.getInputProps("description")}
            />

            <Group mt="md">
              <Button type="submit">Profil aktualisieren</Button>
            </Group>
          </form>
        </Stack>
      </Flex>
    </div>
  );
}
