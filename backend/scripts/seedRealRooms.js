import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { geohashForLocation } from 'geofire-common';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account
let serviceAccount;
const saPath = path.join(__dirname, '../serviceAccountKey.json');
if (fs.existsSync(saPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
}

if (!serviceAccount) {
  console.error('serviceAccountKey.json not found');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

// Real Indian city locations with coordinates
const cities = [
  {
    name: 'Mumbai',
    lat: 19.0760,
    lng: 72.8777,
    state: 'Maharashtra',
    bounds: 0.1
  },
  {
    name: 'Delhi',
    lat: 28.7041,
    lng: 77.1025,
    state: 'Delhi',
    bounds: 0.1
  },
  {
    name: 'Bangalore',
    lat: 12.9716,
    lng: 77.5946,
    state: 'Karnataka',
    bounds: 0.1
  },
  {
    name: 'Hyderabad',
    lat: 17.3850,
    lng: 78.4867,
    state: 'Telangana',
    bounds: 0.1
  },
  {
    name: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    state: 'Tamil Nadu',
    bounds: 0.1
  },
  {
    name: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    state: 'West Bengal',
    bounds: 0.1
  },
  {
    name: 'Pune',
    lat: 18.5204,
    lng: 73.8567,
    state: 'Maharashtra',
    bounds: 0.08
  },
  {
    name: 'Ahmedabad',
    lat: 23.0225,
    lng: 72.5714,
    state: 'Gujarat',
    bounds: 0.08
  },
  {
    name: 'Jaipur',
    lat: 26.9124,
    lng: 75.7873,
    state: 'Rajasthan',
    bounds: 0.08
  },
  {
    name: 'Lucknow',
    lat: 26.8467,
    lng: 80.9462,
    state: 'Uttar Pradesh',
    bounds: 0.08
  },
  {
    name: 'Chandigarh',
    lat: 30.7333,
    lng: 76.7794,
    state: 'Chandigarh',
    bounds: 0.06
  },
  {
    name: 'Kochi',
    lat: 9.9312,
    lng: 76.2673,
    state: 'Kerala',
    bounds: 0.08
  }
];

// Room templates for Indian market
const roomTemplates = [
  {
    title: 'Cozy Studio {city}',
    description: 'A comfortable studio apartment perfect for professionals. Includes WiFi, kitchen, and utilities.',
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 400,
    price: 15000,
    amenities: ['WiFi', 'Kitchen', 'Heating', 'Water Supply']
  },
  {
    title: '1-Bedroom near {city} Center',
    description: 'Spacious 1-bedroom apartment with modern amenities. Walking distance to public transport and markets.',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 650,
    price: 25000,
    amenities: ['WiFi', 'Kitchen', 'Water Supply', 'Heating', 'Balcony']
  },
  {
    title: '2-Bedroom Family Home',
    description: 'Comfortable 2-bedroom home ideal for families. Includes parking and garden area.',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1000,
    price: 35000,
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Water Supply', 'Patio', 'Security System']
  },
  {
    title: 'Luxury Apartment in Downtown',
    description: 'Premium apartment with high-end finishes. Building includes gym, pool, and 24/7 security.',
    bedrooms: 1,
    bathrooms: 1.5,
    squareFeet: 800,
    price: 45000,
    amenities: ['WiFi', 'Kitchen', 'Gym', 'Pool', 'Security', 'Elevator', 'Water Supply']
  },
  {
    title: 'Budget-Friendly Room',
    description: 'Simple, clean room in shared tenant community. Good for students and working professionals.',
    bedrooms: 0,
    bathrooms: 1,
    squareFeet: 300,
    price: 10000,
    amenities: ['WiFi', 'Water Supply', 'Shared Kitchen']
  }
];

// Generate random rooms for a city
function generateRoomsForCity(city) {
  const rooms = [];
  const roomCount = Math.floor(Math.random() * 5) + 3; // 3-7 rooms per city

  for (let i = 0; i < roomCount; i++) {
    const template = roomTemplates[Math.floor(Math.random() * roomTemplates.length)];
    
    // Add random offset within city bounds
    const latOffset = (Math.random() - 0.5) * city.bounds;
    const lngOffset = (Math.random() - 0.5) * city.bounds;
    
    const latitude = city.lat + latOffset;
    const longitude = city.lng + lngOffset;

    const room = {
      title: template.title.replace('{city}', city.name),
      description: template.description,
      price: template.price + Math.floor(Math.random() * 5000 - 2500),
      bedrooms: template.bedrooms,
      bathrooms: template.bathrooms,
      squareFeet: template.squareFeet + Math.floor(Math.random() * 200 - 100),
      amenities: template.amenities,
      coverImage: `https://via.placeholder.com/400x300?text=${encodeURIComponent(template.title)}`,
      address: {
        street: `${Math.floor(Math.random() * 9000) + 1000} ${['Main', 'Park', 'Central', 'New', 'Market'][Math.floor(Math.random() * 5)]} Road`,
        city: city.name,
        state: city.state,
        zipCode: String(Math.floor(Math.random() * 900000 + 100000)),
        country: 'India'
      },
      location: {
        latitude,
        longitude,
        geohash: geohashForLocation([latitude, longitude])
      },
      availableFrom: new Date().toISOString().split('T')[0],
      availableUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: true,
      owner: 'demo-owner-' + Math.floor(Math.random() * 100),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      rules: {
        maxOccupants: Math.floor(Math.random() * 4) + 1,
        petPolicy: ['allowed', 'not-allowed', 'small-pets-only'][Math.floor(Math.random() * 3)]
      }
    };

    rooms.push(room);
  }

  return rooms;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting to seed real Indian rooms...');

    const roomsCollection = db.collection('rooms');
    let totalRoomsAdded = 0;

    for (const city of cities) {
      console.log(`\n📍 Seeding ${city.name}, ${city.state}...`);
      const rooms = generateRoomsForCity(city);

      for (const room of rooms) {
        await roomsCollection.add(room);
        totalRoomsAdded++;
        console.log(`  ✓ Added: ${room.title} (₹${room.price}/month)`);
      }
    }

    console.log(`\n✨ Successfully seeded ${totalRoomsAdded} rooms across India!`);
    console.log('You can now search rooms by location on the map.');
    console.log('Prices are in INR (Indian Rupees) per month.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
