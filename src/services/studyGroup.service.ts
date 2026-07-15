import StudyGroup from "../models/StudyGroup";

export const getStudyGroupsService = async (subject?: string, search?: string) => {
  const query: Record<string, any> = {};
  if (subject) query.subject = subject;
  if (search) query.name = { $regex: search, $options: "i" };

  return StudyGroup.find(query)
    .populate("creator", "name avatarUrl")
    .sort({ createdAt: -1 });
};

export const getStudyGroupByIdService = async (groupId: string) => {
  return StudyGroup.findById(groupId)
    .populate("creator", "name avatarUrl university")
    .populate("members", "name avatarUrl");
};

export const createStudyGroupService = async (data: any, creatorId: string) => {
  return StudyGroup.create({
    ...data,
    coverImageUrl:
      data.coverImageUrl ||
      "https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg",
    creator: creatorId,
    members: [creatorId],
  });
};

export const joinStudyGroupService = async (groupId: string, userId: string) => {
  const group = await StudyGroup.findById(groupId);
  if (!group) return null;

  if (group.members.some((member) => member.toString() === userId)) {
    return { alreadyMember: true };
  }

  group.members.push(userId as any);
  await group.save();

  return { alreadyMember: false, group };
};

export const leaveStudyGroupService = async (groupId: string, userId: string) => {
  const group = await StudyGroup.findById(groupId);
  if (!group) return null;

  group.members = group.members.filter((member) => member.toString() !== userId) as any;
  await group.save();

  return group;
};
