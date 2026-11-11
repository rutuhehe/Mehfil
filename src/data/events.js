export const SEED_START = '2026-12-01';

const titles = [
  'Yoga and Mindfulness Morning',
  'Stress-Free Exams Talk',
  'AI for Campus Life',
  'Future of Fintech Seminar',
  'Cybersecurity Awareness Seminar',
  'Startup Night',
  'Alumni Mentor Mixer',
  'Design Sprint Jam',
  'Cloud Basics Workshop',
  'The Creative Collective',
  'Open Mic and Poetry Night',
  'Winter Cultural Fest',
  '24-Hour Campus Hackathon',
  'Build for Good Hackathon',
  'Blood Donation Drive',
  'Clean-up Drive',
  'Book Donation Week',
  'Board Games Night',
  'Open-Air Movie Night',
  'Career Fair 2027',
  'Resume and LinkedIn Clinic',
  'Campus Quiz League',
  'Inter-Department Debate',
  'Chess Open',
  'Futsal Friday Cup',
  'Winter Cricket Cup',
  'Campus Photography Walk',
  'Short Film Screening',
  'Wellness Reset Workshop',
  'Campus Leadership Circle',
  'Creative Portfolio Lab'
];

const categoryMap = {
  'Yoga and Mindfulness Morning': 'Wellness',
  'Stress-Free Exams Talk': 'Wellness',
  'AI for Campus Life': 'Seminar',
  'Future of Fintech Seminar': 'Seminar',
  'Cybersecurity Awareness Seminar': 'Seminar',
  'Startup Night': 'Networking',
  'Alumni Mentor Mixer': 'Networking',
  'Design Sprint Jam': 'Workshop',
  'Cloud Basics Workshop': 'Workshop',
  'The Creative Collective': 'Culture',
  'Open Mic and Poetry Night': 'Culture',
  'Winter Cultural Fest': 'Culture',
  '24-Hour Campus Hackathon': 'Hackathon',
  'Build for Good Hackathon': 'Hackathon',
  'Blood Donation Drive': 'Volunteer',
  'Clean-up Drive': 'Volunteer',
  'Book Donation Week': 'Volunteer',
  'Board Games Night': 'Social',
  'Open-Air Movie Night': 'Social',
  'Career Fair 2027': 'Career',
  'Resume and LinkedIn Clinic': 'Career',
  'Campus Quiz League': 'Competition',
  'Inter-Department Debate': 'Competition',
  'Chess Open': 'Competition',
  'Futsal Friday Cup': 'Sports',
  'Winter Cricket Cup': 'Sports',
  'Campus Photography Walk': 'Create',
  'Short Film Screening': 'Create',
  'Wellness Reset Workshop': 'Wellness',
  'Campus Leadership Circle': 'Networking',
  'Creative Portfolio Lab': 'Create'
};

const venueMap = {
  'Wellness': 'Open Amphitheatre',
  'Seminar': 'Seminar Hall 2',
  'Networking': 'Horizon Lounge',
  'Workshop': 'Innovation Studio',
  'Culture': 'Arts and Media Studio',
  'Hackathon': 'Innovation Studio',
  'Volunteer': 'Main Auditorium',
  'Social': 'Open Amphitheatre',
  'Career': 'Main Auditorium',
  'Competition': 'Seminar Hall 2',
  'Sports': 'Sports Ground',
  'Create': 'Arts and Media Studio'
};

const baseText = {
  'Yoga and Mindfulness Morning': 'A calm early start to reset your mind before the week begins.',
  'Stress-Free Exams Talk': 'Practical advice to stay centred and efficient during exam season.',
  'AI for Campus Life': 'Explore how AI can improve student projects and everyday campus life.',
  'Future of Fintech Seminar': 'A look at how digital finance is reshaping campus and careers.',
  'Cybersecurity Awareness Seminar': 'Learn the basics of protection, privacy and responsible digital habits.',
  'Startup Night': 'Meet founders, pilots, and friends building their next big idea.',
  'Alumni Mentor Mixer': 'Connect with alumni across fields and discover your next move.',
  'Design Sprint Jam': 'Build a concept in an intense, collaborative creative session.',
  'Cloud Basics Workshop': 'Hands-on introduction to cloud tools and practical deployment workflows.',
  'The Creative Collective': 'An open studio for expression, performance, and creative exchange.',
  'Open Mic and Poetry Night': 'Bring a poem, a thought, or just your curiosity to the stage.',
  'Winter Cultural Fest': 'Music, performance and heritage celebrations in one campus night.',
  '24-Hour Campus Hackathon': 'A fast-paced build challenge to ship something meaningful in one night.',
  'Build for Good Hackathon': 'Solve a real campus problem with a team of builders and thinkers.',
  'Blood Donation Drive': 'Give time, give life, and become part of a meaningful campus act.',
  'Clean-up Drive': 'Help the campus breathe a little cleaner and shine a little brighter.',
  'Book Donation Week': 'Share books, stories, and knowledge with the wider student community.',
  'Board Games Night': 'Warm up your strategy, laughs, and little competitive streaks.',
  'Open-Air Movie Night': 'A relaxed evening of stories, snacks, and campus energy under the sky.',
  'Career Fair 2027': 'Meet recruiters, student leaders and organisations shaping your future.',
  'Resume and LinkedIn Clinic': 'Polish your profile and sharpen your job pitch before the next opportunity.',
  'Campus Quiz League': 'Proof that your knowledge is not just interesting, but competitive.',
  'Inter-Department Debate': 'Challenge ideas, build arguments, and enjoy a thoughtful clash of perspective.',
  'Chess Open': 'Play, learn, and watch the best minds on campus face off.',
  'Futsal Friday Cup': 'Fast-footed fun for players and cheerleaders alike.',
  'Winter Cricket Cup': 'Bring your team spirit and enjoy a crisp tournament weekend.',
  'Campus Photography Walk': 'Frame campus stories in motion and light, one click at a time.',
  'Short Film Screening': 'A curated mini-screening of bold ideas from emerging student filmmakers.',
  'Wellness Reset Workshop': 'Re-centre with movement, breathing, and mindful habits for the week.',
  'Campus Leadership Circle': 'A conversation on initiative, confidence, and building your own path.',
  'Creative Portfolio Lab': 'Shape your portfolio with feedback, polish, and practical design advice.'
};

const organizerMap = {
  'Wellness': 'Student Wellness Office',
  'Seminar': 'Academic Affairs',
  'Networking': 'Career Guild',
  'Workshop': 'Innovation Cell',
  'Culture': 'Cultural Council',
  'Hackathon': 'Tech Society',
  'Volunteer': 'Community Desk',
  'Social': 'Student Life',
  'Career': 'Placement Cell',
  'Competition': 'Campus Events Committee',
  'Sports': 'Sports Council',
  'Create': 'Media and Design Club'
};

const dates = [
  '2026-12-03', '2026-12-05', '2026-12-07', '2026-12-08', '2026-12-10', '2026-12-12', '2026-12-14', '2026-12-16', '2026-12-17', '2026-12-19', '2026-12-21', '2026-12-22', '2026-12-25', '2026-12-28', '2026-12-30', '2027-01-02', '2027-01-04', '2027-01-05', '2027-01-07', '2027-01-09', '2027-01-12', '2027-01-14', '2027-01-16', '2027-01-18', '2027-01-21', '2027-01-24', '2027-01-27', '2027-01-30', '2026-10-12', '2026-10-20', '2026-10-28'
];

const startTimes = [
  '08:00', '09:30', '10:00', '12:00', '14:30', '16:00', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const priceMap = {
  'Wellness': 0,
  'Seminar': 0,
  'Networking': 0,
  'Workshop': 0,
  'Culture': 0,
  'Hackathon': 0,
  'Volunteer': 0,
  'Social': 0,
  'Career': 0,
  'Competition': 0,
  'Sports': 0,
  'Create': 0
};

const capacityMap = {
  'Yoga and Mindfulness Morning': 120,
  'Stress-Free Exams Talk': 200,
  'AI for Campus Life': 160,
  'Future of Fintech Seminar': 140,
  'Cybersecurity Awareness Seminar': 180,
  'Startup Night': 90,
  'Alumni Mentor Mixer': 110,
  'Design Sprint Jam': 80,
  'Cloud Basics Workshop': 75,
  'The Creative Collective': 130,
  'Open Mic and Poetry Night': 150,
  'Winter Cultural Fest': 220,
  '24-Hour Campus Hackathon': 200,
  'Build for Good Hackathon': 180,
  'Blood Donation Drive': 250,
  'Clean-up Drive': 160,
  'Book Donation Week': 120,
  'Board Games Night': 80,
  'Open-Air Movie Night': 130,
  'Career Fair 2027': 260,
  'Resume and LinkedIn Clinic': 90,
  'Campus Quiz League': 100,
  'Inter-Department Debate': 120,
  'Chess Open': 90,
  'Futsal Friday Cup': 70,
  'Winter Cricket Cup': 100,
  'Campus Photography Walk': 70,
  'Short Film Screening': 110,
  'Wellness Reset Workshop': 70,
  'Campus Leadership Circle': 95,
  'Creative Portfolio Lab': 80
};

const seatsTakenMap = {
  'Yoga and Mindfulness Morning': 76,
  'Stress-Free Exams Talk': 170,
  'AI for Campus Life': 104,
  'Future of Fintech Seminar': 60,
  'Cybersecurity Awareness Seminar': 130,
  'Startup Night': 74,
  'Alumni Mentor Mixer': 92,
  'Design Sprint Jam': 54,
  'Cloud Basics Workshop': 41,
  'The Creative Collective': 78,
  'Open Mic and Poetry Night': 95,
  'Winter Cultural Fest': 170,
  '24-Hour Campus Hackathon': 180,
  'Build for Good Hackathon': 172,
  'Blood Donation Drive': 250,
  'Clean-up Drive': 145,
  'Book Donation Week': 93,
  'Board Games Night': 64,
  'Open-Air Movie Night': 111,
  'Career Fair 2027': 210,
  'Resume and LinkedIn Clinic': 71,
  'Campus Quiz League': 48,
  'Inter-Department Debate': 90,
  'Chess Open': 79,
  'Futsal Friday Cup': 62,
  'Winter Cricket Cup': 90,
  'Campus Photography Walk': 39,
  'Short Film Screening': 74,
  'Wellness Reset Workshop': 31,
  'Campus Leadership Circle': 20,
  'Creative Portfolio Lab': 42
};

const gradientKeys = ['aurora', 'sunset', 'mint', 'slate', 'gold', 'berry'];

// Build the event catalogue from a fixed seed so all listed dates stay inside Dec 2026 to Jan 2027.
export const EVENTS = titles.map((title, index) => {
  const category = categoryMap[title];
  const date = dates[index] ?? dates[index % dates.length];
  const startHour = startTimes[index % startTimes.length];
  const endHour = new Date(`2026-12-01T${startHour}:00`);
  endHour.setHours(endHour.getHours() + 2 + (index % 3));
  const start = new Date(`${date}T${startHour}:00`);
  const end = new Date(`${date}T${endHour.toTimeString().slice(0, 5)}:00`);

  return {
    id: `evt-${index + 1}`,
    title,
    category,
    description: baseText[title],
    venue: venueMap[category],
    start: start.toISOString(),
    end: end.toISOString(),
    capacity: capacityMap[title],
    seatsTaken: seatsTakenMap[title],
    price: priceMap[category],
    organizer: organizerMap[category],
    gradient: gradientKeys[index % gradientKeys.length],
    status: date < SEED_START ? 'past' : 'upcoming'
  };
});

export const PAST_EVENTS = [
  {
    id: 'evt-past-1',
    title: 'Campus Leadership Circle',
    category: 'Networking',
    description: 'A conversation on initiative, confidence, and building your own path.',
    venue: 'Horizon Lounge',
    start: '2026-10-12T18:00:00.000Z',
    end: '2026-10-12T19:30:00.000Z',
    capacity: 95,
    seatsTaken: 95,
    price: 0,
    organizer: 'Career Guild',
    gradient: 'aurora',
    status: 'past'
  },
  {
    id: 'evt-past-2',
    title: 'Creative Portfolio Lab',
    category: 'Create',
    description: 'Shape your portfolio with feedback, polish, and practical design advice.',
    venue: 'Arts and Media Studio',
    start: '2026-10-20T17:00:00.000Z',
    end: '2026-10-20T19:00:00.000Z',
    capacity: 80,
    seatsTaken: 72,
    price: 0,
    organizer: 'Media and Design Club',
    gradient: 'slate',
    status: 'past'
  },
  {
    id: 'evt-past-3',
    title: 'Wellness Reset Workshop',
    category: 'Wellness',
    description: 'Re-centre with movement, breathing, and mindful habits for the week.',
    venue: 'Open Amphitheatre',
    start: '2026-10-28T09:00:00.000Z',
    end: '2026-10-28T10:30:00.000Z',
    capacity: 70,
    seatsTaken: 48,
    price: 0,
    organizer: 'Student Wellness Office',
    gradient: 'mint',
    status: 'past'
  }
];

export const ALL_EVENTS = [...EVENTS, ...PAST_EVENTS];
