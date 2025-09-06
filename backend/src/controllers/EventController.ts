import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import { Event } from "../db/models/EventModel";
import { User } from "../db/models/UserModel";
import { In } from "typeorm";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET_PUBLICKEY } from "../accessTokenConfig";
import get_office_user_calendar from "../helpers/get_office_user_calendar";
const create_event = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const userRepo = AppDataSource.getRepository(User);
    const { title, start, end, color, description, note, location, ownerId, organizerId, helpers } = req.body;

    // Validate required fields
    // if (!title || !start || !end || !ownerId || !organizerId) {
    //   return res.status(400).json({ message: "Missing required event fields." });
    // }

    // Check if event with the same title exists
    const existingEvent = await eventRepo.findOneBy({ title });
    if (existingEvent) {
      return res.status(400).json({ message: "The event already exists!" });
    }

    // Check if user exists
    const owner = await userRepo.findOneBy({ id: ownerId });
    const organizer = await userRepo.findOneBy({ id: organizerId });
    const event_helpers = await userRepo.findBy({ id: In(helpers) });

    if (!owner || !organizer || !event_helpers) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create new event instance
    const newEvent = eventRepo.create({
      title,
      start,
      end,
      color,
      description,
      note,
      owner,
      organizer,
      created_by: organizer,
      location,
      helpers: event_helpers,
      is_ms_event: false,
    });

    // Save event to DB
    const addedEvent = await eventRepo.save(newEvent);

    return res.status(201).json({ data: addedEvent, msg: "Event has been added." });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const get_events = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const userRepo = AppDataSource.getRepository(User);

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "No refresh token provided", isLoggedIn: false });
    }

    const decoded: any = jwt.verify(refreshToken, JWT_ACCESS_TOKEN_SECRET_PUBLICKEY);
    const userEmail = decoded.user.email;

    // Find the user in the database
    const user = await userRepo.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Fetch office events
    const officeCalendar = await get_office_user_calendar(userEmail);

    for (const officeEvent of officeCalendar) {
      // Map Office event to your Event entity fields
      const start = new Date(officeEvent.start.dateTime);
      const end = new Date(officeEvent.end.dateTime);

      // Check if this event already exists in DB (based on start/end/title)
      const existingEvent = await eventRepo.findOne({
        where: { start, end, title: officeEvent.subject, owner: { id: user.id } },
      });

      if (!existingEvent) {
        const newEvent = eventRepo.create({
          start,
          end,
          title: officeEvent.subject,
          description: officeEvent.body?.content,
          location: officeEvent.location?.displayName || officeEvent.location?.address?.displayName,
          is_all_day: officeEvent.isAllDay || false,
          color: "yellow",
          owner: user,
          organizer: user, // or map to organizer if you store organizer separately
          is_ms_event: true
        });

        await eventRepo.save(newEvent);
      }
    }

    // Fetch all events with relations
    const events = await eventRepo.find({
      relations: ["owner", "organizer", "helpers","created_by"],
    });

    return res.status(200).json({ data: events, msg: "Events synced and fetched successfully" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      isLoggedIn: true,
      error: `Internal server error: ${error.message}`,
    });
  }
};

const delete_event = async (req: Request, res: Response) => {
  try {
    console.log("EVENT")
    const eventRepo = AppDataSource.getRepository(Event);
    const eventId = Number(req.params.eventId);

    const event = await eventRepo.findOneBy({ id: eventId });

    if (!event) {
      return res.status(404).json({
        msg: "Event not found",
      });
    }

    await eventRepo.delete(eventId);

    return res.status(200).json({
      msg: "Event deleted successfully",
      data: eventId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

const update_event = async (req: Request, res: Response) => {
  try {
    const eventRepo = AppDataSource.getRepository(Event);
    const userRepo = AppDataSource.getRepository(User);

    const eventId = Number(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ msg: "Invalid event ID" });
    }

    const requestData = req.body;
    const { start, end, ownerId, title, note, location, color, helpers, description } = requestData;

    // 1. Find the event
    const event = await eventRepo.findOne({
      where: { id: eventId },
      relations: ["owner", "organizer", "helpers", "created_by"],
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // 2. Update owner if provided
    if (ownerId !== undefined) {
      const ownerIdNum = Number(ownerId);
      if (isNaN(ownerIdNum)) {
        return res.status(400).json({ msg: "Invalid ownerId" });
      }

      const owner = await userRepo.findOneBy({ id: ownerIdNum });
      if (!owner) {
        return res.status(404).json({ msg: "Owner not found" });
      }

      event.owner = owner;
    }

    // 3. Update helpers if provided
    if (helpers !== undefined && Array.isArray(helpers)) {
      const helperIds = helpers.map((id) => Number(id)).filter((n) => !isNaN(n));
      if (helperIds.length > 0) {
        const helperUsers = await userRepo.findBy({ id: In(helperIds) });
        event.helpers = helperUsers;
      } else {
        event.helpers = [];
      }
    }

    // 4. Update other fields if provided
    if (start !== undefined) event.start = start;
    if (end !== undefined) event.end = end;
    if (title !== undefined) event.title = title;
    if (note !== undefined) event.note = note;
    if (location !== undefined) event.location = location;
    if (color !== undefined) event.color = color;
    if (description !== undefined) event.description = description;

    // 5. Save changes
    const updatedEvent = await eventRepo.save(event);

    return res.status(200).json({
      msg: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

export { create_event, get_events, update_event, delete_event };
