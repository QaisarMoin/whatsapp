import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db("whatsapp");
    const collection = db.collection("processed_messages");

    console.log('Fetching data from processed_messages collection...');
    
    // Find all documents in the collection
    const cursor = collection.find({});
    const results = await cursor.toArray();
    
    console.log(`Found ${results.length} documents in the processed_messages collection`);
    
    // Extract and display message information
    let messageCount = 0;
    
    for (const doc of results) {
      console.log(`\nDocument ID: ${doc._id}`);
      
      // Check for messages in metaData.entry[].changes[].value.messages
      if (doc.metaData && doc.metaData.entry && Array.isArray(doc.metaData.entry)) {
        for (const entry of doc.metaData.entry) {
          if (entry.changes && Array.isArray(entry.changes)) {
            for (const change of entry.changes) {
              if (change.value && change.value.messages && Array.isArray(change.value.messages)) {
                for (const msg of change.value.messages) {
                  messageCount++;
                  console.log(`Message ${messageCount}: ${msg.id || 'unknown'} from ${msg.from || 'unknown'}`);
                  
                  if (msg.text && msg.text.body) {
                    console.log(`Content: ${msg.text.body}`);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`\nTotal messages found: ${messageCount}`);

  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the main function
run().catch(console.error);