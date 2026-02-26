import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account key
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found in backend directory');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();
const auth = admin.auth();

/**
 * Seed Firebase with sample data
 */
async function seedFirebase() {
  try {
    console.log('🌱 Starting Firebase seed...\n');

    // 1. Create sample users
    console.log('Creating sample users...');
    
    const users = [
      {
        id: 'user-1',
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'roomOwner',
          phone: '+1-555-0101',
          bio: 'Experienced room owner with 5 years of rental experience',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          isVerified: true,
          rooms: [],
          bookings: [],
          ratings: {
            averageRating: 4.8,
            totalReviews: 24
          },
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      },
      {
        id: 'user-2',
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'tenant',
          phone: '+1-555-0102',
          bio: 'Looking for a comfortable room in Manhattan',
          address: {
            street: '456 Oak Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            country: 'USA'
          },
          isVerified: true,
          rooms: [],
          bookings: [],
          ratings: {
            averageRating: 4.5,
            totalReviews: 8
          },
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      },
      {
        id: 'user-3',
        data: {
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike@example.com',
          role: 'admin',
          phone: '+1-555-0103',
          bio: 'Admin user',
          address: {},
          isVerified: true,
          rooms: [],
          bookings: [],
          ratings: {
            averageRating: 0,
            totalReviews: 0
          },
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      }
    ];

    for (const user of users) {
      try {
        // Create Firebase Auth user
        const authUser = await auth.createUser({
          uid: user.id,
          email: user.data.email,
          password: 'Test@123456',
          displayName: `${user.data.firstName} ${user.data.lastName}`
        });

        // Create Firestore document
        await db.collection('users').doc(user.id).set(user.data);
        console.log(`✅ Created user: ${user.data.email}`);
      } catch (error) {
        if (error.code === 'auth/uid-already-exists') {
          console.log(`⚠️  User already exists: ${user.data.email}`);
        } else {
          console.error(`❌ Error creating user ${user.data.email}:`, error.message);
        }
      }
    }

    // 2. Create sample rooms
    console.log('\nCreating sample rooms...');

    const rooms = [
      {
        id: 'room-1',
        data: {
          title: 'Cozy Studio in Midtown',
          description: 'Beautiful studio apartment with modern amenities. Perfect for professionals. Recently renovated with hardwood floors.',
          owner: 'user-1',
          price: 1800,
          currency: 'USD',
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 450,
          amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking'],
          images: [
            {
              url: 'https://via.placeholder.com/600x400?text=Studio+1',
              altText: 'Studio bedroom',
              uploadedAt: admin.firestore.Timestamp.now()
            },
            {
              url: 'https://via.placeholder.com/600x400?text=Studio+Kitchen',
              altText: 'Kitchen area',
              uploadedAt: admin.firestore.Timestamp.now()
            }
          ],
          coverImage: 'https://via.placeholder.com/600x400?text=Studio+1',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            formattedAddress: '123 Main St, New York, NY 10001'
          },
          location: {
            latitude: 40.7505,
            longitude: -73.9972
          },
          availableFrom: admin.firestore.Timestamp.fromDate(new Date('2026-03-01')),
          availableUntil: null,
          availability: true,
          rules: {
            maxOccupants: 2,
            petPolicy: 'small-only',
            smokingPolicy: false,
            guestPolicy: 'Overnight guests allowed with notice',
            cancellationPolicy: '30 days notice'
          },
          ratings: {
            averageRating: 4.8,
            totalReviews: 24
          },
          reviews: [],
          bookings: [],
          isActive: true,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      },
      {
        id: 'room-2',
        data: {
          title: '2BR Apartment in Upper West Side',
          description: 'Spacious 2-bedroom apartment with beautiful views. Close to Central Park and subway. Recently renovated.',
          owner: 'user-1',
          price: 2800,
          currency: 'USD',
          bedrooms: 2,
          bathrooms: 1.5,
          squareFeet: 750,
          amenities: ['WiFi', 'Parking', 'Air Conditioning', 'Heating', 'Kitchen', 'Doorman'],
          images: [
            {
              url: 'https://via.placeholder.com/600x400?text=2BR+Living',
              altText: 'Living room',
              uploadedAt: admin.firestore.Timestamp.now()
            }
          ],
          coverImage: 'https://via.placeholder.com/600x400?text=2BR+Living',
          address: {
            street: '500 Amsterdam Ave',
            city: 'New York',
            state: 'NY',
            zipCode: '10024',
            country: 'USA',
            formattedAddress: '500 Amsterdam Ave, New York, NY 10024'
          },
          location: {
            latitude: 40.7829,
            longitude: -73.9654
          },
          availableFrom: admin.firestore.Timestamp.fromDate(new Date('2026-02-15')),
          availableUntil: null,
          availability: true,
          rules: {
            maxOccupants: 4,
            petPolicy: 'allowed',
            smokingPolicy: false,
            guestPolicy: 'Guests allowed',
            cancellationPolicy: '60 days notice'
          },
          ratings: {
            averageRating: 4.9,
            totalReviews: 18
          },
          reviews: [],
          bookings: [],
          isActive: true,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      },
      {
        id: 'room-3',
        data: {
          title: 'Shared Room in Brooklyn',
          description: 'Affordable shared room with friendly roommates. Great for students. Walking distance to subway.',
          owner: 'user-1',
          price: 900,
          currency: 'USD',
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 250,
          amenities: ['WiFi', 'Kitchen', 'Pet Friendly'],
          images: [
            {
              url: 'https://via.placeholder.com/600x400?text=Shared+Room',
              altText: 'Shared bedroom',
              uploadedAt: admin.firestore.Timestamp.now()
            }
          ],
          coverImage: 'https://via.placeholder.com/600x400?text=Shared+Room',
          address: {
            street: '789 Maple St',
            city: 'Brooklyn',
            state: 'NY',
            zipCode: '11201',
            country: 'USA',
            formattedAddress: '789 Maple St, Brooklyn, NY 11201'
          },
          location: {
            latitude: 40.6976,
            longitude: -73.9772
          },
          availableFrom: admin.firestore.Timestamp.fromDate(new Date('2026-02-01')),
          availableUntil: null,
          availability: true,
          rules: {
            maxOccupants: 2,
            petPolicy: 'small-only',
            smokingPolicy: false,
            guestPolicy: 'No overnight guests',
            cancellationPolicy: '15 days notice'
          },
          ratings: {
            averageRating: 4.3,
            totalReviews: 12
          },
          reviews: [],
          bookings: [],
          isActive: true,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }
      }
    ];

    for (const room of rooms) {
      try {
        await db.collection('rooms').doc(room.id).set(room.data);
        console.log(`✅ Created room: ${room.data.title}`);
      } catch (error) {
        console.error(`❌ Error creating room ${room.data.title}:`, error.message);
      }
    }

    // 3. Create sample booking
    console.log('\nCreating sample booking...');

    const booking = {
      id: 'booking-1',
      data: {
        room: 'room-1',
        tenant: 'user-2',
        owner: 'user-1',
        checkInDate: admin.firestore.Timestamp.fromDate(new Date('2026-03-01')),
        checkOutDate: admin.firestore.Timestamp.fromDate(new Date('2026-06-01')),
        numberOfMonths: 3,
        status: 'confirmed',
        totalPrice: 5400,
        deposit: {
          amount: 1800,
          paid: true,
          paidDate: admin.firestore.Timestamp.now()
        },
        payment: {
          amount: 5400,
          status: 'completed',
          method: 'credit_card',
          transactionId: 'txn_123456789',
          paidDate: admin.firestore.Timestamp.now()
        },
        notes: {
          tenant: 'Looking forward to staying here!',
          owner: 'Welcome aboard!'
        },
        messages: [
          {
            sender: 'user-2',
            message: 'Hi, can I move in a day early?',
            sentAt: admin.firestore.Timestamp.now()
          }
        ],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    };

    try {
      await db.collection('bookings').doc(booking.id).set(booking.data);
      console.log(`✅ Created booking: ${booking.data.room}`);
    } catch (error) {
      console.error(`❌ Error creating booking:`, error.message);
    }

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Sample user credentials:');
    console.log('  Room Owner: john@example.com / Test@123456');
    console.log('  Tenant: jane@example.com / Test@123456');
    console.log('  Admin: mike@example.com / Test@123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run seed
seedFirebase();
