// Roster taken from "Volunteers and Duty Spots (Finalized).xlsx".
// Batch 1 / Batch 2 come from the visitation sheet (column order: 1st row = Batch 1, 2nd row = Batch 2).
// Door volunteers are not in the visitation sheet, so they have no batch.

export const DUTY_SPOTS = [
  "Main Venue",
  "Food Court",
  "Food Stalls",
  "Door 01",
  "Door 02",
  "Door 03",
];

export const TIMETABLE = [
  ["8:30 – 9:30", "Both batches"],
  ["9:30 – 10:30", "Batch 1"],
  ["10:30 – 11:30", "Batch 2"],
  ["11:30 – 12:30", "Both batches"],
  ["12:30 – 2:20", "Both batches"],
];

export const SEED_STUDENTS = [
  { id: "s01", name: "Mohit Manoj Nair", spot: "Food Court", batch: 1 },
  { id: "s02", name: "Muhammad Afaaf", spot: "Food Court", batch: 2 },
  { id: "s03", name: "Simbarashe Foko", spot: "Food Court", batch: 1 },
  { id: "s04", name: "Mohammed Moinuddin", spot: "Main Venue", batch: 1 },
  { id: "s05", name: "Shaswin Saravanan", spot: "Main Venue", batch: 2 },
  { id: "s06", name: "Moksh Kumar", spot: "Food Stalls", batch: 1 },
  { id: "s07", name: "Syeda Zunairah Akhtar", spot: "Food Stalls", batch: 2 },
  { id: "s08", name: "Vethuli Dharmaratne", spot: "Food Stalls", batch: 1 },
  { id: "s09", name: "Tehreem Usman", spot: "Food Stalls", batch: 2 },
  { id: "s10", name: "Yenumi Chenaya Kahawala", spot: "Main Venue", batch: 1 },
  { id: "s11", name: "Ayesha Adnan", spot: "Main Venue", batch: null },
  { id: "s12", name: "Aadi Naith Adhikari", spot: "Food Court", batch: 2 },
  { id: "s13", name: "Ahmed Shaikh", spot: "Main Venue", batch: 2 },
  { id: "s14", name: "Ibrahim Wael", spot: "Door 01", batch: null },
  { id: "s15", name: "Muhammad Tihami", spot: "Food Court", batch: 1 },
  { id: "s16", name: "Omar Shahid", spot: "Food Court", batch: 2 },
  { id: "s17", name: "Gian Ilagan", spot: "Food Court", batch: 1 },
  { id: "s18", name: "Mahmoud Mobarak", spot: "Main Venue", batch: 1 },
  { id: "s19", name: "Anas Elsayed Ali", spot: "Main Venue", batch: 2 },
  { id: "s20", name: "Jana Mohamed Hashem", spot: "Door 02", batch: null },
  { id: "s21", name: "Ayesha Mishaal", spot: "Main Venue", batch: 1 },
  { id: "s22", name: "Manahil Ali Khan", spot: "Main Venue", batch: 2 },
  { id: "s23", name: "Abiha Rizvi", spot: "Main Venue", batch: 1 },
  { id: "s24", name: "Serena Jumshad", spot: "Main Venue", batch: 2 },
  { id: "s25", name: "Freny Surana", spot: "Door 02", batch: null },
  { id: "s26", name: "Aizah Khan", spot: "Door 03", batch: null },
  { id: "s27", name: "Haiqa Ansari", spot: "Door 03", batch: null },
  { id: "s28", name: "Haya Kashif", spot: "Door 03", batch: null },
  { id: "s29", name: "Muskan Khan", spot: "Door 03", batch: null },
  { id: "s30", name: "Thaseefa Mohamed", spot: "Door 02", batch: null },
  { id: "s31", name: "Talha Nauman", spot: "Door 01", batch: null },
  { id: "s32", name: "Ibaad Ali Ansari", spot: "Food Court", batch: 2 },
  { id: "s33", name: "Safa Osman", spot: "Door 01", batch: null },
  { id: "s34", name: "Aminah Anjum", spot: "Door 01", batch: null },
];
