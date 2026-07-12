import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db";
import User from "../models/User";
import Resource from "../models/Resource";
import StudyGroup from "../models/StudyGroup";
import Booking from "../models/Booking";
import Review from "../models/Review";

const run = async () => {
  await connectDB();

  const destroy = process.argv.includes("--destroy");

  if (destroy) {
    await Promise.all([
      User.deleteMany(),
      Resource.deleteMany(),
      StudyGroup.deleteMany(),
      Booking.deleteMany(),
      Review.deleteMany(),
    ]);
    console.log("All collections cleared.");
    await mongoose.connection.close();
    return;
  }

  await Promise.all([
    User.deleteMany(),
    Resource.deleteMany(),
    StudyGroup.deleteMany(),
    Booking.deleteMany(),
    Review.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash("Password123", 10);

  const admin = await User.create({
    name: "Tanvir Ahmed",
    email: "tanvir.ahmed@studynest.com",
    password: passwordHash,
    role: "admin",
    university: "StudyNest HQ",
    bio: "Platform administrator for StudyNest.",
    avatarUrl: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
  });

  const student1 = await User.create({
    name: "Nusrat Jahan",
    email: "nusrat.jahan@studynest.com",
    password: passwordHash,
    role: "student",
    university: "University of Dhaka",
    bio: "3rd year CSE student, loves organizing notes for classmates.",
    avatarUrl: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
  });

  const student2 = await User.create({
    name: "Rafiul Islam",
    email: "rafiul.islam@studynest.com",
    password: passwordHash,
    role: "student",
    university: "BUET",
    bio: "EEE student, into circuit theory and signal processing.",
    avatarUrl: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
  });

  const tutor1 = await User.create({
    name: "Sadia Rahman",
    email: "sadia.rahman@studynest.com",
    password: passwordHash,
    role: "student",
    university: "North South University",
    bio: "BBA graduate turned finance tutor. 4+ years of tutoring experience.",
    avatarUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    isTutor: true,
    tutorSubjects: ["Accounting", "Finance", "Business Statistics"],
    hourlyRate: 500,
  });

  const tutor2 = await User.create({
    name: "Imran Kabir",
    email: "imran.kabir@studynest.com",
    password: passwordHash,
    role: "student",
    university: "BUET",
    bio: "CSE graduate, teaches Data Structures & Algorithms and DBMS.",
    avatarUrl: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
    isTutor: true,
    tutorSubjects: ["Data Structures", "Algorithms", "Database Systems"],
    hourlyRate: 600,
  });

  const tutor3 = await User.create({
    name: "Farzana Akter",
    email: "farzana.akter@studynest.com",
    password: passwordHash,
    role: "student",
    university: "Dhaka Medical College",
    bio: "MBBS student, tutors Biology and Physiology for admission candidates.",
    avatarUrl: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
    isTutor: true,
    tutorSubjects: ["Biology", "Physiology"],
    hourlyRate: 450,
  });

  const resources = await Resource.insertMany([
    {
      title: "Data Structures & Algorithms — Full Semester Notes",
      shortDescription: "Complete DSA notes covering arrays to graph algorithms.",
      fullDescription:
        "Handwritten and typed notes covering arrays, linked lists, stacks, queues, trees, heaps, hashing, sorting, and graph algorithms (BFS, DFS, Dijkstra, MST). Includes solved problems from previous semester exams and a quick-revision formula sheet at the end.",
      subject: "Computer Science",
      resourceType: "notes",
      priceType: "free",
      price: 0,
      coverImageUrl: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
      fileUrl: "https://drive.google.com/example-dsa-notes",
      uploader: student2._id,
      avgRating: 4.7,
      reviewCount: 2,
      downloadCount: 214,
    },
    {
      title: "Database Management Systems — ER Diagrams & Normalization Guide",
      shortDescription: "Step-by-step guide to ER modeling, normalization, and SQL.",
      fullDescription:
        "Covers Chen-notation ER diagrams, conversion to relational schema, normalization up to BCNF, and a full SQL practice set with GROUP BY, HAVING, joins, and views. Great for DBMS midterm prep.",
      subject: "Computer Science",
      resourceType: "notes",
      priceType: "free",
      price: 0,
      coverImageUrl: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
      fileUrl: "https://drive.google.com/example-dbms-notes",
      uploader: tutor2._id,
      avgRating: 4.5,
      reviewCount: 1,
      downloadCount: 158,
    },
    {
      title: "Financial Accounting — Complete Slide Deck",
      shortDescription: "Lecture slides covering journal entries to financial statements.",
      fullDescription:
        "A full slide deck used across two semesters, covering the accounting cycle, journal entries, ledgers, trial balance, adjusting entries, and preparation of financial statements. Includes worked examples.",
      subject: "Business",
      resourceType: "slides",
      priceType: "paid",
      price: 150,
      coverImageUrl: "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg",
      fileUrl: "https://drive.google.com/example-accounting-slides",
      uploader: tutor1._id,
      avgRating: 4.8,
      reviewCount: 3,
      downloadCount: 96,
    },
    {
      title: "Human Physiology — Organ Systems Summary Notes",
      shortDescription: "Condensed physiology notes for admission & first-year exams.",
      fullDescription:
        "Summary notes on the cardiovascular, respiratory, nervous, and endocrine systems, written for quick revision before practicals and viva. Includes labeled diagrams.",
      subject: "Medical",
      resourceType: "notes",
      priceType: "free",
      price: 0,
      coverImageUrl: "https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg",
      fileUrl: "https://drive.google.com/example-physiology-notes",
      uploader: tutor3._id,
      avgRating: 4.6,
      reviewCount: 2,
      downloadCount: 133,
    },
    {
      title: "Signals & Systems — Solved Problem Bank",
      shortDescription: "120 solved problems on Fourier, Laplace, and Z-transforms.",
      fullDescription:
        "A curated problem bank with fully worked solutions for continuous and discrete-time signals, Fourier series/transform, Laplace transform, and Z-transform — organized by topic and difficulty.",
      subject: "Engineering",
      resourceType: "book",
      priceType: "paid",
      price: 200,
      coverImageUrl: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg",
      fileUrl: "https://drive.google.com/example-signals-book",
      uploader: student2._id,
      avgRating: 4.4,
      reviewCount: 1,
      downloadCount: 71,
    },
    {
      title: "IELTS Writing Task 2 — Model Answers & Templates",
      shortDescription: "25 model essays with band-9 vocabulary annotations.",
      fullDescription:
        "A collection of 25 Task 2 model answers across common topic categories (education, technology, environment, society), annotated with band-9 vocabulary and linking phrases, plus a reusable essay template.",
      subject: "Language",
      resourceType: "notes",
      priceType: "free",
      price: 0,
      coverImageUrl: "https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg",
      fileUrl: "https://drive.google.com/example-ielts-notes",
      uploader: student1._id,
      avgRating: 4.9,
      reviewCount: 4,
      downloadCount: 302,
    },
    {
      title: "Digital Logic Design — Lecture Video Series",
      shortDescription: "8-part video series on combinational & sequential circuits.",
      fullDescription:
        "A recorded lecture series covering Boolean algebra, K-maps, combinational circuits (adders, multiplexers), and sequential circuits (flip-flops, counters, state machines) with worked examples on a whiteboard.",
      subject: "Engineering",
      resourceType: "video",
      priceType: "free",
      price: 0,
      coverImageUrl: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
      fileUrl: "https://drive.google.com/example-logic-videos",
      uploader: tutor2._id,
      avgRating: 4.3,
      reviewCount: 1,
      downloadCount: 89,
    },
    {
      title: "Business Statistics — Formula Sheet & Practice Set",
      shortDescription: "Key formulas plus 40 practice questions with answers.",
      fullDescription:
        "A compact formula sheet covering probability distributions, hypothesis testing, regression, and correlation, paired with 40 practice questions and full answer keys.",
      subject: "Business",
      resourceType: "notes",
      priceType: "free",
      price: 0,
      coverImageUrl: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg",
      fileUrl: "https://drive.google.com/example-statistics-notes",
      uploader: tutor1._id,
      avgRating: 4.2,
      reviewCount: 1,
      downloadCount: 64,
    },
  ]);

  await StudyGroup.insertMany([
    {
      name: "DSA Grinders — DU CSE",
      subject: "Computer Science",
      description:
        "Weekly problem-solving sessions for Data Structures & Algorithms, focused on competitive programming and interview prep.",
      coverImageUrl: "https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg",
      creator: student2._id,
      members: [student2._id, student1._id, tutor2._id],
      meetingSchedule: "Every Saturday, 8:00 PM (online, Google Meet)",
    },
    {
      name: "DMC Physiology Circle",
      subject: "Medical",
      description:
        "Study group for first and second year medical students preparing for physiology practicals and card exams.",
      coverImageUrl: "https://images.pexels.com/photos/4098365/pexels-photo-4098365.jpeg",
      creator: tutor3._id,
      members: [tutor3._id, student1._id],
      meetingSchedule: "Tuesdays & Fridays, 7:00 PM (in-person, DMC library)",
    },
    {
      name: "IELTS Band 8+ Club",
      subject: "Language",
      description:
        "Peer group for IELTS candidates practicing writing and speaking together, with weekly mock tests.",
      coverImageUrl: "https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg",
      creator: student1._id,
      members: [student1._id, student2._id, tutor1._id],
      meetingSchedule: "Sundays, 5:00 PM (online, Zoom)",
    },
  ]);

  await Review.insertMany([
    {
      resource: resources[0]._id,
      user: student1._id,
      rating: 5,
      comment: "Saved me before my midterm. The graph algorithm section is gold.",
    },
    {
      resource: resources[0]._id,
      user: tutor1._id,
      rating: 4,
      comment: "Very thorough, though a couple of diagrams could be clearer.",
    },
    {
      resource: resources[2]._id,
      user: student1._id,
      rating: 5,
      comment: "Worth every taka. Clear examples for every adjusting entry type.",
    },
  ]);

  await Booking.insertMany([
    {
      tutor: tutor2._id,
      student: student1._id,
      subject: "Data Structures",
      date: "2026-07-20",
      timeSlot: "6:00 PM - 7:00 PM",
      status: "confirmed",
    },
    {
      tutor: tutor1._id,
      student: student2._id,
      subject: "Accounting",
      date: "2026-07-22",
      timeSlot: "8:00 PM - 9:00 PM",
      status: "pending",
    },
  ]);

  console.log("Seed complete.");
  console.log("---------------------------------------------");
  console.log("Login credentials (all use password: Password123)");
  console.log("Admin:   tanvir.ahmed@studynest.com");
  console.log("Student: nusrat.jahan@studynest.com");
  console.log("Student: rafiul.islam@studynest.com");
  console.log("Tutor:   sadia.rahman@studynest.com");
  console.log("Tutor:   imran.kabir@studynest.com");
  console.log("Tutor:   farzana.akter@studynest.com");
  console.log("---------------------------------------------");

  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
