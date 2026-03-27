import venueHero from '/src/assets/aicte-lab-hero.jpg'
import thumb1 from '/src/assets/aicte-lab-thumb-1.jpg'
import thumb2 from '/src/assets/aicte-lab-thumb-2.jpg'
import thumb3 from '/src/assets/aicte-lab-thumb-3.jpg'
import thumb4 from '/src/assets/aicte-lab-thumb-4.jpg'
import equip1 from '/src/assets/equipment-3d-printer.jpg'
import equip2 from '/src/assets/equipment-laser-cutter.jpg'
import equip3 from '/src/assets/equipment-cnc-machine.jpg'
import equip4 from '/src/assets/equipment-pcb-printer.jpg'
import avatar1 from '/src/assets/avatar-1.jpg'
import avatar2 from '/src/assets/avatar-2.jpg'

const venuesData = [
  {
    id: 'aicte-idea-lab',
    name: 'AICTE Idea Lab',
    location: 'First Floor, Main Block',
    capacity: 50,
    size: '1500 sq.ft.',
    description:
      'The AICTE Idea Lab is a state-of-the-art facility designed to foster innovation and creativity among students. It provides a hands-on learning environment where students can transform their ideas into tangible projects. Equipped with modern tools and technologies, the lab is an ideal space for workshops, training sessions, and collaborative projects.',
    amenities: [
      'High-speed Wi-Fi',
      'Air Conditioning',
      'Projector and Screen',
      'Whiteboard and Markers',
      'Sound System',
      'Dedicated Workstations',
    ],
    equipment: [
      {
        name: '3D Printer',
        specs: 'Ultimaker S5',
        description: 'High-resolution 3D printing for rapid prototyping.',
        quantity: 2,
        image: equip1,
      },
      {
        name: 'Laser Cutter',
        specs: 'Trotec Speedy 100',
        description: 'Precision cutting and engraving on various materials.',
        quantity: 1,
        image: equip2,
      },
      {
        name: 'CNC Machine',
        specs: 'Bantam Tools Desktop CNC',
        description: 'For milling custom PCBs and machining soft metals.',
        quantity: 1,
        image: equip3,
      },
      {
        name: 'PCB Printer',
        specs: 'Voltera V-One',
        description: 'Prints multi-layer circuit boards for electronic projects.',
        quantity: 1,
        image: equip4,
      },
    ],
    bookingProcess: [
      {
        name: 'Check Availability',
        description:
          'Use the calendar to find an open date for your event. You can see which dates are booked, open, or closed for maintenance.',
      },
      {
        name: 'Submit Request',
        description:
          'Fill out the booking form with your event details. Our team will review your request and get back to you within 24 hours.',
      },
      {
        name: 'Confirmation',
        description:
          'Once approved, you will receive a confirmation email with all the details for your scheduled event. You are all set!',
      },
    ],
    availability: {
      '2023-10-02': 'open',
      '2023-10-03': 'booked',
      '2023-10-04': 'booked',
      '2023-10-09': 'open',
      '2023-10-10': 'closed',
      '2023-10-11': 'closed',
      '2023-10-15': 'open',
    },
    reviews: [
      {
        name: 'Priya Sharma',
        department: 'Electronics & Communication',
        review:
          'The Idea Lab has been a game-changer for our final year project. The equipment is top-notch and the support staff are incredibly helpful. A fantastic resource for all students!',
        avatar: avatar1,
      },
      {
        name: 'Rahul Verma',
        department: 'Mechanical Engineering',
        review:
          'I attended a workshop on 3D printing here and it was an amazing experience. The lab is well-maintained and provides a great environment for learning and building.',
        avatar: avatar2,
      },
    ],
    images: {
      hero: venueHero,
      thumbnails: [thumb1, thumb2, thumb3, thumb4],
    },
  },
  {
    id: 'platinum-hall',
    name: 'Platinum Hall',
    location: 'Main Block, Auditorium',
    capacity: 400,
    size: '5000 sq.ft.',
    description:
      'A large, fully-equipped auditorium suitable for major events, conferences, and performances. Features a large stage, professional lighting, and sound systems.',
    amenities: [
      'High-speed Wi-Fi',
      'Central Air Conditioning',
      'Stage with Podium',
      'Professional Sound System',
      'Theatrical Lighting',
      'Green Rooms',
    ],
    equipment: [],
    bookingProcess: [
      {
        name: 'Check Availability',
        description: 'Consult the university events calendar for open dates.',
      },
      {
        name: 'Submit Formal Request',
        description: 'Submit a booking application to the administration office.',
      },
      {
        name: 'Receive Permit',
        description: 'Once approved, a permit for use will be issued.',
      },
    ],
    availability: {},
    reviews: [],
    images: {
      hero: 'https://via.placeholder.com/1280x720.png?text=Platinum+Hall',
      thumbnails: [
        'https://via.placeholder.com/300x200.png?text=Thumb+1',
        'https://via.placeholder.com/300x200.png?text=Thumb+2',
        'https://via.placeholder.com/300x200.png?text=Thumb+3',
        'https://via.placeholder.com/300x200.png?text=Thumb+4',
      ],
    },
  },
  {
    id: 'seminar-hall-a',
    name: 'Seminar Hall A',
    location: 'Ground Floor',
    capacity: 120,
    size: '2000 sq.ft.',
    description:
      'A medium-sized hall perfect for seminars, guest lectures, and departmental events. Equipped with modern AV facilities.',
    amenities: ['Projector', 'Sound System', 'Wi-Fi', 'Podium'],
    equipment: [],
    bookingProcess: [
      {
        name: 'Check Availability',
        description: 'Check the online portal for available slots.',
      },
      {
        name: 'Book Online',
        description: 'Fill and submit the online booking form.',
      },
      {
        name: 'Get Confirmation',
        description: 'Receive an email confirmation for your booking.',
      },
    ],
    availability: {},
    reviews: [],
    images: {
      hero: 'https://via.placeholder.com/1280x720.png?text=Seminar+Hall+A',
      thumbnails: [
        'https://via.placeholder.com/300x200.png?text=Thumb+1',
        'https://via.placeholder.com/300x200.png?text=Thumb+2',
        'https://via.placeholder.com/300x200.png?text=Thumb+3',
        'https://via.placeholder.com/300x200.png?text=Thumb+4',
      ],
    },
  },
  {
    id: 'conference-room-a',
    name: 'Conference Room A',
    location: 'Admin Block',
    capacity: 15,
    size: '400 sq.ft.',
    description:
      'A formal meeting space for small groups, interviews, or board meetings. Includes video conferencing facilities.',
    amenities: ['Video Conferencing', 'Whiteboard', 'Wi-Fi', 'Coffee Machine'],
    equipment: [],
    bookingProcess: [
      {
        name: 'Check Schedule',
        description: 'Check the shared calendar for availability.',
      },
      {
        name: 'Reserve Slot',
        description: 'Book your required time slot directly in the calendar.',
      },
      {
        name: 'Notify Admin',
        description: 'Inform the admin staff about your booking.',
      },
    ],
    availability: {},
    reviews: [],
    images: {
      hero: 'https://via.placeholder.com/1280x720.png?text=Conference+Room+A',
      thumbnails: [
        'https://via.placeholder.com/300x200.png?text=Thumb+1',
        'https://via.placeholder.com/300x200.png?text=Thumb+2',
        'https://via.placeholder.com/300x200.png?text=Thumb+3',
        'https://via.placeholder.com/300x200.png?text=Thumb+4',
      ],
    },
  },
  {
    id: 'board-meeting-room',
    name: 'Board Meeting Room',
    location: 'Second Floor, East Wing',
    capacity: 12,
    size: '350 sq.ft.',
    description:
      'An executive-level meeting room for high-level discussions and presentations. Features premium furniture and privacy.',
    amenities: [
      'Large Screen Display',
      'Secure Wi-Fi',
      'Soundproofing',
      'Refreshment Station',
    ],
    equipment: [],
    bookingProcess: [
      {
        name: 'Request via EA',
        description: 'Submit a request to the Executive Assistant.',
      },
      {
        name: 'Await Approval',
        description: 'Wait for approval from the management.',
      },
      {
        name: 'Booking Confirmation',
        description: 'Receive a formal confirmation of your booking.',
      },
    ],
    availability: {},
    reviews: [],
    images: {
      hero: 'https://via.placeholder.com/1280x720.png?text=Board+Meeting+Room',
      thumbnails: [
        'https://via.placeholder.com/300x200.png?text=Thumb+1',
        'https://via.placeholder.com/300x200.png?text=Thumb+2',
        'https://via.placeholder.com/300x200.png?text=Thumb+3',
        'https://via.placeholder.com/300x200.png?text=Thumb+4',
      ],
    },
  },
  {
    id: 'conference-room-b',
    name: 'Conference Room B',
    location: 'Third Floor, West Wing',
    capacity: 30,
    size: '600 sq.ft.',
    description:
      'A versatile conference room for team meetings, workshops, and training sessions. Flexible seating arrangements.',
    amenities: ['Projector', 'Whiteboard', 'Wi-Fi', 'Modular Furniture'],
    equipment: [],
    bookingProcess: [
      {
        name: 'Check Availability',
        description: 'Check the online portal for available slots.',
      },
      {
        name: 'Book Online',
        description: 'Fill and submit the online booking form.',
      },
      {
        name: 'Get Confirmation',
        description: 'Receive an email confirmation for your booking.',
      },
    ],
    availability: {},
    reviews: [],
    images: {
      hero: 'https://via.placeholder.com/1280x720.png?text=Conference+Room+B',
      thumbnails: [
        'https://via.placeholder.com/300x200.png?text=Thumb+1',
        'https://via.placeholder.com/300x200.png?text=Thumb+2',
        'https://via.placeholder.com/300x200.png?text=Thumb+3',
        'https://via.placeholder.com/300x200.png?text=Thumb+4',
      ],
    },
  },
  {
    id: 'open-air-theatre',
    name: 'Open Air Theatre',
    location: 'Campus Ground',
    capacity: 500,
    size: '10000 sq.ft.',
    description:
      'A large outdoor venue for cultural events, concerts, and large gatherings. Features a permanent stage and tiered seating.',
    amenities: ['Stage', 'Outdoor Lighting', 'Power Outlets', 'Lawn Seating'],
    equipment: [],
    bookingProcess: [
      {
        name: 'Check Availability',
        description: 'Consult the university events calendar for open dates.',
      },
      {
        name: 'Submit Formal Request',
        description: 'Submit a booking application to the student affairs office.',
      },
      {
        name: 'Receive Permit',
        description: 'Once approved, a permit for use will be issued.',
      },
    ],
    availability: {},
    reviews: [],
    images: {
      hero: 'https://via.placeholder.com/1280x720.png?text=Open+Air+Theatre',
      thumbnails: [
        'https://via.placeholder.com/300x200.png?text=Thumb+1',
        'https://via.placeholder.com/300x200.png?text=Thumb+2',
        'https://via.placeholder.com/300x200.png?text=Thumb+3',
        'https://via.placeholder.com/300x200.png?text=Thumb+4',
      ],
    },
  },
]

export default venuesData
